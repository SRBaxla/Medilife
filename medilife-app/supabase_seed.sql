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