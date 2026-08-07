// Supabase Edge Function: Meta WhatsApp Status Webhook Listener
// Location: supabase/functions/whatsapp-status-webhook/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const VERIFY_TOKEN = Deno.env.get("META_WEBHOOK_VERIFY_TOKEN") || "medilife_wa_verify_token_2026";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req: Request) => {
  const url = new URL(req.url);

  // 1. GET Handler: Meta Webhook Verification Challenge
  if (req.method === "GET") {
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("Meta Webhook Verification Succeeded!");
      return new Response(challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
    } else {
      console.warn("Meta Webhook Verification Failed: Invalid Token");
      return new Response("Forbidden: Invalid verify token", { status: 403 });
    }
  }

  // 2. POST Handler: Incoming WhatsApp Status Receipts ('delivered', 'read', 'failed')
  if (req.method === "POST") {
    try {
      const body = await req.json();

      // Collect statuses grouped by new status type for batch processing
      const deliveredIds: string[] = [];
      const readIds: string[] = [];
      const failedIds: string[] = [];

      const entries = body.entry || [];
      for (const entry of entries) {
        const changes = entry.changes || [];
        for (const change of changes) {
          const value = change.value || {};
          const statuses = value.statuses || [];

          for (const s of statuses) {
            const metaMessageId = s.id;
            const statusType = s.status; // 'delivered', 'read', 'failed'

            if (metaMessageId && statusType) {
              if (statusType === "delivered") deliveredIds.push(metaMessageId);
              else if (statusType === "read") readIds.push(metaMessageId);
              else if (statusType === "failed") failedIds.push(metaMessageId);
            }
          }
        }
      }

      const now = new Date().toISOString();
      const batchPromises: Promise<any>[] = [];

      // Efficient Batched Queries using .in() to keep execution time under Deno timeouts
      if (deliveredIds.length > 0) {
        batchPromises.push(
          supabase
            .from("campaign_messages")
            .update({ status: "delivered", updated_at: now })
            .in("meta_message_id", deliveredIds)
        );
      }

      if (readIds.length > 0) {
        batchPromises.push(
          supabase
            .from("campaign_messages")
            .update({ status: "read", updated_at: now })
            .in("meta_message_id", readIds)
        );
      }

      if (failedIds.length > 0) {
        batchPromises.push(
          supabase
            .from("campaign_messages")
            .update({ status: "failed", updated_at: now })
            .in("meta_message_id", failedIds)
        );
      }

      // Execute batch updates concurrently
      await Promise.all(batchPromises);

      console.log(`Webhook Batched Update Complete: ${deliveredIds.length} delivered, ${readIds.length} read, ${failedIds.length} failed`);

      // Return 200 OK immediately to Meta
      return new Response(
        JSON.stringify({ 
          status: "received", 
          processed: { delivered: deliveredIds.length, read: readIds.length, failed: failedIds.length } 
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } catch (err: any) {
      console.error("Webhook processing error:", err);
      return new Response(JSON.stringify({ status: "processed_with_error", error: err.message }), { status: 200 });
    }
  }

  return new Response("Method not allowed", { status: 405 });
});
