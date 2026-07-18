-- ============================================================================
-- SQL Seed Migration Script for Supabase PostgreSQL Backend
-- Target: multi-tenant Pathology Lab SaaS environment (Jhansi Medilife Lab)
-- NABL / ISO Compliant Database Structure
-- ============================================================================

-- 1. Ensure core extensions are loaded
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

-- 2. Insert sample tenant into tenants table
-- Subdomain matches currentTenantSlug 'jhansi-medilife-tenant-01'
-- ID matches VITE_SUPABASE_PUBLISHABLE_KEY / VITE_SUPABASE_URL client config
INSERT INTO public.tenants (id, name, subdomain, created_at)
VALUES (
  '42ed7e81-66a5-4b5b-af5e-cc27b8a9705e', 
  'Jhansi Medilife Pathology Lab', 
  'jhansi-medilife-tenant-01',
  now()
)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, subdomain = EXCLUDED.subdomain;

-- 3. Insert auth accounts into Supabase internal auth schema (auth.users)
-- Passwords are encrypted dynamically at migration runtime using crypt/blowfish

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
  confirmation_token
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
  ''
)
ON CONFLICT (id) DO UPDATE 
SET encrypted_password = EXCLUDED.encrypted_password;

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
  confirmation_token
)
VALUES (
  'p1p1p1p1-p1p1-p1p1-p1p1-p1p1p1p1p1p1',
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
  ''
)
ON CONFLICT (id) DO UPDATE 
SET encrypted_password = EXCLUDED.encrypted_password;

-- 4. Map auth users to public.user_profiles records matching tenant_id UUID

-- Profile A: Administrator Profile
INSERT INTO public.user_profiles (
  id,
  user_id,
  first_name,
  last_name,
  role,
  tenant_id,
  email
)
VALUES (
  'b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1',
  'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1',
  'Aisha',
  'Patel',
  'admin',
  '42ed7e81-66a5-4b5b-af5e-cc27b8a9705e',
  'admin@medilife.in'
)
ON CONFLICT (id) DO UPDATE
SET first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, role = EXCLUDED.role;

-- Profile B: Patient Profile
INSERT INTO public.user_profiles (
  id,
  user_id,
  first_name,
  last_name,
  role,
  tenant_id,
  email
)
VALUES (
  'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1',
  'p1p1p1p1-p1p1-p1p1-p1p1-p1p1p1p1p1p1',
  'John',
  'Doe',
  'patient',
  '42ed7e81-66a5-4b5b-af5e-cc27b8a9705e',
  'patient@example.com'
)
ON CONFLICT (id) DO UPDATE
SET first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, role = EXCLUDED.role;

-- ============================================================================
-- TESTING & SIGN-IN CREDENTIALS DETAILS:
-- Once executed, developers and QA engineers can test using the login screen:
--
-- 1. Admin/Staff Dashboard access:
--    - Email: admin@medilife.in
--    - Password: password123
--    - Tab: Admin / Staff
--    - Resolved Subdomain: jhansi-medilife-tenant-01
--
-- 2. Patient Portal access:
--    - Email: patient@example.com
--    - Password: password123
--    - Tab: Patient
--    - Resolved Subdomain: jhansi-medilife-tenant-01
-- ============================================================================
