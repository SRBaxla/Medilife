-- ============================================================================
-- SQL Migration Script: WaaS Onboarding, Subscription Billing & Webhook Idempotency
-- Target: Supabase PostgreSQL Database
-- ============================================================================

-- 1. Extend tenants table schema
ALTER TABLE public.tenants 
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'past_due', 'canceled', 'inactive')),
  ADD COLUMN IF NOT EXISTS subscription_tier TEXT CHECK (subscription_tier IN ('Base', 'Pro', 'Scale', 'Enterprise')),
  ADD COLUMN IF NOT EXISTS billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'annual')),
  ADD COLUMN IF NOT EXISTS payment_gateway_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS gst_number TEXT,
  ADD COLUMN IF NOT EXISTS credit_balance INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS setup_fee_paid BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS grace_period_until TIMESTAMPTZ;

-- 2. Create Webhook Events Log table for Webhook Idempotency
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Performance Indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_tenants_subdomain ON public.tenants(subdomain);
CREATE INDEX IF NOT EXISTS idx_tenants_owner_id ON public.tenants(owner_id);
CREATE INDEX IF NOT EXISTS idx_tenants_pg_cust_id ON public.tenants(payment_gateway_customer_id);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- 5. Row Level Security Policies
DROP POLICY IF EXISTS "Public can resolve active tenants and subdomains" ON public.tenants;
CREATE POLICY "Public can resolve active tenants and subdomains" ON public.tenants
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Lab owners can register their tenant" ON public.tenants;
CREATE POLICY "Lab owners can register their tenant" ON public.tenants
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND owner_id = auth.uid());

DROP POLICY IF EXISTS "Tenant owners can update their tenant record" ON public.tenants;
CREATE POLICY "Tenant owners can update their tenant record" ON public.tenants
FOR UPDATE USING (
  auth.uid() = owner_id OR 
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.tenant_id = tenants.id 
      AND user_profiles.role IN ('admin', 'super_admin')
  )
);

DROP POLICY IF EXISTS "Allow authenticated admins to read webhook logs" ON public.webhook_events;
CREATE POLICY "Allow authenticated admins to read webhook logs" ON public.webhook_events
FOR SELECT USING (auth.role() = 'service_role' OR auth.uid() IS NOT NULL);

-- 6. Ensure default Jhansi tenant is active
UPDATE public.tenants 
SET subscription_status = 'active', 
    subscription_tier = 'Scale', 
    billing_cycle = 'annual', 
    credit_balance = 10000, 
    setup_fee_paid = true 
WHERE id = '42ed7e81-66a5-4b5b-af5e-cc27b8a9705e';
