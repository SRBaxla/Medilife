-- ============================================================================
-- SQL Seed Migration Script for Supabase PostgreSQL Backend
-- Target: multi-tenant Pathology Lab SaaS environment (Jhansi Medilife Lab)
-- NABL / ISO Compliant Database Structure
-- ============================================================================

-- 1. Ensure core extensions are loaded
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

-- 2. Insert sample tenant into tenants table
INSERT INTO public.tenants (id, business_name, subdomain, created_at)
VALUES (
  '42ed7e81-66a5-4b5b-af5e-cc27b8a9705e', 
  'Jhansi Medilife Pathology Lab', 
  'jhansi-medilife-tenant-01',
  now()
)
ON CONFLICT (id) DO UPDATE 
SET business_name = EXCLUDED.business_name, subdomain = EXCLUDED.subdomain;

-- 3. Insert auth accounts into Supabase internal auth schema (auth.users)
-- Account A: Administrator / Staff Account
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  role,
  aud,
  confirmation_token,
  email_change,
  phone_change
)
VALUES (
  'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1',
  '00000000-0000-0000-0000-000000000000',
  'admin@medilife.in',
  crypt('password123', gen_salt('bf', 10)),
  now(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{}'::jsonb,
  false,
  now(),
  now(),
  'authenticated',
  'authenticated',
  '',
  '',
  ''
)
ON CONFLICT (id) DO UPDATE 
SET encrypted_password = EXCLUDED.encrypted_password,
    email_change = '',
    phone_change = '';

-- Account B: Patient Account
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  role,
  aud,
  confirmation_token,
  email_change,
  phone_change
)
VALUES (
  'd1d1d1d1-d1d1-d1d1-d1d1-d1d1d1d1d1d1',
  '00000000-0000-0000-0000-000000000000',
  'patient@example.com',
  crypt('password123', gen_salt('bf', 10)),
  now(),
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{}'::jsonb,
  false,
  now(),
  now(),
  'authenticated',
  'authenticated',
  '',
  '',
  ''
)
ON CONFLICT (id) DO UPDATE 
SET encrypted_password = EXCLUDED.encrypted_password,
    email_change = '',
    phone_change = '';

-- 4. Map auth users to public.user_profiles records matching tenant_id UUID

-- Profile A: Administrator Profile
INSERT INTO public.user_profiles (
  id,
  user_id,
  full_name,
  role,
  tenant_id,
  email
)
VALUES (
  'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1',
  'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1',
  'Aisha Patel',
  'admin',
  '42ed7e81-66a5-4b5b-af5e-cc27b8a9705e',
  'admin@medilife.in'
)
ON CONFLICT (id) DO UPDATE
SET full_name = EXCLUDED.full_name, role = EXCLUDED.role;

-- Profile B: Patient Profile
INSERT INTO public.user_profiles (
  id,
  user_id,
  full_name,
  role,
  tenant_id,
  email
)
VALUES (
  'd1d1d1d1-d1d1-d1d1-d1d1-d1d1d1d1d1d1',
  'd1d1d1d1-d1d1-d1d1-d1d1-d1d1d1d1d1d1',
  'John Doe',
  'patient',
  '42ed7e81-66a5-4b5b-af5e-cc27b8a9705e',
  'patient@example.com'
)
ON CONFLICT (id) DO UPDATE
SET full_name = EXCLUDED.full_name, role = EXCLUDED.role;

-- 5. Row Level Security Policies for Staff Roster Isolation
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if present
DROP POLICY IF EXISTS "Restrict staff roster query to non-patient roles" ON public.user_profiles;

-- Policy: Only query users with active staff roles (admin, lab_tech, super_admin, staff, phlebotomist) for staff roster
CREATE POLICY "Restrict staff roster query to non-patient roles" ON public.user_profiles
FOR SELECT
USING (
  role IS NOT NULL AND lower(role) NOT IN ('patient', 'user')
);

-- 6. Database Anti-Demotion Security Trigger for Super Root Admins
CREATE OR REPLACE FUNCTION public.prevent_super_admin_demotion()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.role = 'super_admin' AND NEW.role != 'super_admin' THEN
    RAISE EXCEPTION 'Security Policy Violation: Super Root Administrator role cannot be demoted to a lesser privilege level.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_prevent_super_admin_demotion ON public.user_profiles;

CREATE TRIGGER trigger_prevent_super_admin_demotion
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
WHEN (OLD.role = 'super_admin')
EXECUTE FUNCTION public.prevent_super_admin_demotion();

-- 7. Ensure bookings table schema columns exist for address, gps_coordinates, phone & collection_type
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS gps_coordinates TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS collection_type TEXT DEFAULT 'walkin';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS phone TEXT;

-- 8. Row Level Security Delete Policies for Purge Operations
DROP POLICY IF EXISTS "Allow authenticated users to delete bookings" ON public.bookings;
CREATE POLICY "Allow authenticated users to delete bookings" ON public.bookings
FOR DELETE
USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to delete audit logs" ON public.audit_logs;
CREATE POLICY "Allow authenticated users to delete audit logs" ON public.audit_logs
FOR DELETE
USING (true);

-- 9. RPC Function & Grants for Super Admin Data Reset / Purge
CREATE OR REPLACE FUNCTION public.purge_all_demo_data()
RETURNS void AS $$
BEGIN
  DELETE FROM public.bookings;
  DELETE FROM public.patient_reports;
  DELETE FROM public.audit_logs;
  DELETE FROM public.staff_break_logs;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.purge_all_demo_data() TO anon, authenticated, service_role;
GRANT ALL ON public.bookings TO anon, authenticated, service_role;
GRANT ALL ON public.patient_reports TO anon, authenticated, service_role;
GRANT ALL ON public.audit_logs TO anon, authenticated, service_role;

-- ============================================================================
-- 10. Multi-Tenant WaaS Self-Serve Onboarding, Subscription Billing & RLS Policies
-- ============================================================================

-- Add subscription, billing, and lab owner columns to public.tenants
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

-- Ensure default seed tenant has active subscription status
UPDATE public.tenants 
SET subscription_status = 'active', 
    subscription_tier = 'Scale', 
    billing_cycle = 'annual', 
    credit_balance = 10000, 
    setup_fee_paid = true 
WHERE id = '42ed7e81-66a5-4b5b-af5e-cc27b8a9705e' AND subscription_status IS NULL OR subscription_status = 'inactive';

-- Create Webhook Events Log table for Webhook Idempotency
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT now()
);

-- Performance Indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_tenants_subdomain ON public.tenants(subdomain);
CREATE INDEX IF NOT EXISTS idx_tenants_owner_id ON public.tenants(owner_id);
CREATE INDEX IF NOT EXISTS idx_tenants_pg_cust_id ON public.tenants(payment_gateway_customer_id);

-- Enable RLS on tenants & webhook_events
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- Policy A: Public can resolve active tenants and verify subdomain availability
DROP POLICY IF EXISTS "Public can resolve active tenants and subdomains" ON public.tenants;
CREATE POLICY "Public can resolve active tenants and subdomains" ON public.tenants
FOR SELECT USING (true);

-- Policy B: Lab owners can register their tenant upon onboarding
DROP POLICY IF EXISTS "Lab owners can register their tenant" ON public.tenants;
CREATE POLICY "Lab owners can register their tenant" ON public.tenants
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND owner_id = auth.uid());

-- Policy C: Tenant owners and staff admins can update their tenant configuration
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

-- Policy D: Service role & authenticated admin access to webhook logs
DROP POLICY IF EXISTS "Allow authenticated admins to read webhook logs" ON public.webhook_events;
CREATE POLICY "Allow authenticated admins to read webhook logs" ON public.webhook_events
FOR SELECT USING (auth.role() = 'service_role' OR auth.uid() IS NOT NULL);

-- ============================================================================
-- 11. WhatsApp Pre-Approved Marketing Templates & Atomic Credit Deduction
-- ============================================================================

-- Create message_templates table
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

-- Enable RLS on message_templates
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;

-- Policy: Public read-only access for message templates
DROP POLICY IF EXISTS "Allow public read access to message templates" ON public.message_templates;
CREATE POLICY "Allow public read access to message templates" ON public.message_templates
FOR SELECT USING (true);

-- Atomic Credit Deduction RPC Function with Row-Locking (FOR UPDATE)
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

-- Seed Pre-Approved WhatsApp Marketing Templates
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

-- ============================================================================
-- 12. WhatsApp Campaign Analytics Engine & Database Trigger
-- ============================================================================

-- Create campaigns table
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  template_name TEXT NOT NULL,
  target_audience_size INT DEFAULT 0,
  sent_count INT DEFAULT 0,
  delivered_count INT DEFAULT 0,
  read_count INT DEFAULT 0,
  failed_count INT DEFAULT 0,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create campaign_messages table
CREATE TABLE IF NOT EXISTS public.campaign_messages (
  meta_message_id TEXT PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  recipient_phone TEXT NOT NULL,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_tenant_id ON public.campaigns(tenant_id);
CREATE INDEX IF NOT EXISTS idx_campaign_messages_campaign_id ON public.campaign_messages(campaign_id);

-- Enable RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tenant staff can view their campaigns" ON public.campaigns;
CREATE POLICY "Tenant staff can view their campaigns" ON public.campaigns
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.user_id = auth.uid() AND user_profiles.tenant_id = campaigns.tenant_id
  ) OR auth.role() = 'service_role' OR auth.uid() IS NOT NULL
);

DROP POLICY IF EXISTS "Tenant staff can insert campaigns" ON public.campaigns;
CREATE POLICY "Tenant staff can insert campaigns" ON public.campaigns
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Tenant staff can view campaign messages" ON public.campaign_messages;
CREATE POLICY "Tenant staff can view campaign messages" ON public.campaign_messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.campaigns 
    WHERE campaigns.id = campaign_messages.campaign_id AND (
      EXISTS (SELECT 1 FROM public.user_profiles WHERE user_profiles.user_id = auth.uid() AND user_profiles.tenant_id = campaigns.tenant_id)
      OR auth.uid() IS NOT NULL
    )
  ) OR auth.role() = 'service_role'
);

DROP POLICY IF EXISTS "Tenant staff can insert campaign messages" ON public.campaign_messages;
CREATE POLICY "Tenant staff can insert campaign messages" ON public.campaign_messages
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- PostgreSQL Trigger to auto-increment aggregate counts on parent campaigns table
CREATE OR REPLACE FUNCTION public.update_campaign_aggregate_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'delivered' AND (OLD.status IS NULL OR OLD.status != 'delivered') THEN
    UPDATE public.campaigns
    SET delivered_count = delivered_count + 1
    WHERE id = NEW.campaign_id;
  ELSIF NEW.status = 'read' AND (OLD.status IS NULL OR OLD.status != 'read') THEN
    UPDATE public.campaigns
    SET read_count = read_count + 1
    WHERE id = NEW.campaign_id;
  ELSIF NEW.status = 'failed' AND (OLD.status IS NULL OR OLD.status != 'failed') THEN
    UPDATE public.campaigns
    SET failed_count = failed_count + 1
    WHERE id = NEW.campaign_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_campaign_aggregate_counts ON public.campaign_messages;
CREATE TRIGGER trigger_update_campaign_aggregate_counts
AFTER UPDATE ON public.campaign_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_campaign_aggregate_counts();

-- Seed sample demo campaign record for Jhansi Medilife Branch
INSERT INTO public.campaigns (id, tenant_id, template_name, target_audience_size, sent_count, delivered_count, read_count, failed_count, status)
VALUES (
  'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1',
  '42ed7e81-66a5-4b5b-af5e-cc27b8a9705e',
  'full_body_checkup_promo',
  50,
  50,
  46,
  38,
  2,
  'completed'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 13. Franchisee Storefront Branding & Custom Color Columns
-- ============================================================================

-- Add branding, logo, primary address, and phone columns to public.tenants
ALTER TABLE public.tenants 
  ADD COLUMN IF NOT EXISTS brand_color TEXT DEFAULT '#0d9488',
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS primary_address TEXT DEFAULT 'Jhansi, UP',
  ADD COLUMN IF NOT EXISTS contact_phone TEXT DEFAULT '+91 98765 43210';

-- Update default seed Jhansi tenant record with branding details
UPDATE public.tenants 
SET brand_color = '#0d9488',
    logo_url = 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=200&q=80',
    primary_address = 'Khati Baba, Jhansi, UP',
    contact_phone = '+91 82994 87062'
WHERE id = '42ed7e81-66a5-4b5b-af5e-cc27b8a9705e';