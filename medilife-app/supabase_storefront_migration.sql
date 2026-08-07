-- ============================================================================
-- SQL Migration Script: Franchisee Storefront Branding Columns
-- Target: Supabase PostgreSQL Database
-- ============================================================================

-- 1. Add branding, logo, primary address, and phone columns to public.tenants
ALTER TABLE public.tenants 
  ADD COLUMN IF NOT EXISTS brand_color TEXT DEFAULT '#0d9488',
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS primary_address TEXT DEFAULT 'Jhansi, UP',
  ADD COLUMN IF NOT EXISTS contact_phone TEXT DEFAULT '+91 98765 43210';

-- 2. Update default seed Jhansi tenant record with branding details
UPDATE public.tenants 
SET brand_color = '#0d9488',
    logo_url = 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=200&q=80',
    primary_address = 'Khati Baba, Jhansi, UP',
    contact_phone = '+91 82994 87062'
WHERE id = '42ed7e81-66a5-4b5b-af5e-cc27b8a9705e';
