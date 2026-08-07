-- ============================================================================
-- SQL Migration Script: WhatsApp Pre-Approved Marketing Templates & Campaign Credit Deduction
-- Target: Supabase PostgreSQL Database
-- ============================================================================

-- 1. Create message_templates table
CREATE TABLE IF NOT EXISTS public.message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT UNIQUE NOT NULL,
  meta_template_id TEXT NOT NULL,
  category TEXT DEFAULT 'MARKETING' CHECK (category IN ('MARKETING', 'UTILITY', 'AUTHENTICATION')),
  body_text TEXT NOT NULL,
  variable_count INT DEFAULT 0,
  button_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Public read-only access for message templates
DROP POLICY IF EXISTS "Allow public read access to message templates" ON public.message_templates;
CREATE POLICY "Allow public read access to message templates" ON public.message_templates
FOR SELECT USING (true);

-- 4. Atomic Credit Deduction RPC Function with Row-Locking (FOR UPDATE)
CREATE OR REPLACE FUNCTION public.deduct_tenant_credits(
  p_tenant_id UUID,
  p_required_credits INT
)
RETURNS JSONB AS $$
DECLARE
  v_current_balance INT;
  v_new_balance INT;
BEGIN
  -- Row locking via FOR UPDATE to prevent race conditions
  SELECT credit_balance INTO v_current_balance
  FROM public.tenants
  WHERE id = p_tenant_id
  FOR UPDATE;

  IF v_current_balance IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Tenant not found');
  END IF;

  IF v_current_balance < p_required_credits THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'Insufficient credits', 
      'current_balance', v_current_balance, 
      'required_credits', p_required_credits
    );
  END IF;

  v_new_balance := v_current_balance - p_required_credits;

  UPDATE public.tenants
  SET credit_balance = v_new_balance
  WHERE id = p_tenant_id;

  RETURN jsonb_build_object(
    'success', true, 
    'previous_balance', v_current_balance, 
    'deducted_credits', p_required_credits, 
    'remaining_balance', v_new_balance
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.deduct_tenant_credits(UUID, INT) TO anon, authenticated, service_role;

-- 5. Seed Pre-Approved WhatsApp Marketing Templates
INSERT INTO public.message_templates (template_name, meta_template_id, category, body_text, variable_count, button_text)
VALUES
  (
    'full_body_checkup_promo',
    'meta_tpl_full_body_01',
    'MARKETING',
    'Hello {{1}}, stay proactive with your health! Get 20% off on Complete Full Body Profile at {{2}}. Book today!',
    2,
    'Book Test Now'
  ),
  (
    'diabetes_screening_offer',
    'meta_tpl_diabetes_02',
    'MARKETING',
    'Hi {{1}}, special HbA1c & Fasting Glucose Package available for {{2}} at {{3}}. Early detection saves lives!',
    3,
    'Claim Offer'
  ),
  (
    'monsoon_fever_package',
    'meta_tpl_monsoon_03',
    'MARKETING',
    'Dear {{1}}, protect your family from Dengue & Typhoid with our Monsoon Health Shield at {{2}}.',
    2,
    'Book Home Sample'
  )
ON CONFLICT (template_name) DO UPDATE 
SET body_text = EXCLUDED.body_text, variable_count = EXCLUDED.variable_count, button_text = EXCLUDED.button_text;
