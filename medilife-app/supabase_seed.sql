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