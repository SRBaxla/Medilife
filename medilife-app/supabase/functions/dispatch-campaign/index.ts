// Supabase Edge Function: Outbound WhatsApp Campaign Dispatch
// Location: supabase/functions/dispatch-campaign/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const WHATSAPP_API_TOKEN = Deno.env.get("WHATSAPP_API_TOKEN") || "mock_wa_token_2026";
const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID") || "10987654321";

const COST_PER_MESSAGE = 5; // 5 credits per marketing message

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface CampaignPayload {
  tenant_id: string;
  template_id: string;
  audience_phone_numbers: string[];
  variables?: string[];
}

serve(async (req: Request) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload: CampaignPayload = await req.json();
    const { tenant_id, template_id, audience_phone_numbers, variables = [] } = payload;

    // 1. Payload Validation
    if (!tenant_id || !template_id || !audience_phone_numbers || !Array.isArray(audience_phone_numbers) || audience_phone_numbers.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: tenant_id, template_id, audience_phone_numbers" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const totalRecipients = audience_phone_numbers.length;
    const requiredCredits = totalRecipients * COST_PER_MESSAGE;

    // 2. Fetch Template Details from public.message_templates
    let query = supabase.from("message_templates").select("*");
    if (template_id.includes("-")) {
      query = query.eq("id", template_id);
    } else {
      query = query.eq("template_name", template_id);
    }

    const { data: template, error: tplErr } = await query.maybeSingle();

    if (tplErr || !template) {
      return new Response(
        JSON.stringify({ error: "Invalid template_id or template record not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Atomic Credit Deduction via PostgreSQL RPC (FOR UPDATE Row-Locking)
    const { data: deductionResult, error: rpcErr } = await supabase.rpc("deduct_tenant_credits", {
      p_tenant_id: tenant_id,
      p_required_credits: requiredCredits,
    });

    if (rpcErr) {
      console.error("Credit deduction RPC execution error:", rpcErr);
      return new Response(
        JSON.stringify({ error: "Database error during credit deduction transaction" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!deductionResult || !deductionResult.success) {
      console.warn(`Insufficient credit balance for tenant [${tenant_id}]: Required ${requiredCredits}, Current ${deductionResult?.current_balance || 0}`);
      return new Response(
        JSON.stringify({
          error: "402 Payment Required: Insufficient WhatsApp credit balance",
          current_balance: deductionResult?.current_balance || 0,
          required_credits: requiredCredits,
          cost_per_message: COST_PER_MESSAGE,
        }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Map Variables to Meta WhatsApp Business API Components Structure
    const bodyParameters = variables.map((v) => ({
      type: "text",
      text: String(v || ""),
    }));

    const waPayloadTemplate = {
      messaging_product: "whatsapp",
      type: "template",
      template: {
        name: template.meta_template_id || template.template_name,
        language: { code: "en_US" },
        components: [
          {
            type: "body",
            parameters: bodyParameters,
          },
        ],
      },
    };

    // 5. Dispatch Messages to Meta WhatsApp Business API
    let queuedCount = 0;
    const dispatchErrors: any[] = [];

    for (const recipientPhone of audience_phone_numbers) {
      const sanitizedPhone = recipientPhone.replace(/[^0-9]/g, "");

      if (WHATSAPP_API_TOKEN === "mock_wa_token_2026") {
        // Simulated local development / presentation mode
        queuedCount++;
      } else {
        try {
          const res = await fetch(`https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${WHATSAPP_API_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...waPayloadTemplate,
              to: sanitizedPhone,
            }),
          });

          if (res.ok) {
            queuedCount++;
          } else {
            const errData = await res.json();
            dispatchErrors.push({ phone: sanitizedPhone, error: errData });
          }
        } catch (postErr) {
          dispatchErrors.push({ phone: sanitizedPhone, error: postErr });
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        messages_queued: queuedCount,
        total_recipients: totalRecipients,
        deducted_credits: requiredCredits,
        remaining_balance: deductionResult.remaining_balance,
        dispatch_errors: dispatchErrors.length > 0 ? dispatchErrors : undefined,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Campaign Dispatch Internal Error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal Campaign Processing Error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
