-- ============================================================================
-- SQL Migration Script: WhatsApp Campaign Analytics & Real-Time Receipt Tracking
-- Target: Supabase PostgreSQL Database
-- ============================================================================

-- 1. Create campaigns table
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

-- 2. Create campaign_messages table
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

-- 3. Row Level Security (RLS)
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

-- 4. PostgreSQL Trigger to auto-increment aggregate counts on parent campaigns table
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

-- 5. Seed sample demo campaign record for Jhansi Medilife Branch
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
