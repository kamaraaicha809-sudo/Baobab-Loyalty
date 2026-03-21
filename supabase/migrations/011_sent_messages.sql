-- ============================================
-- Table sent_messages : journal des messages envoyés
-- ============================================

CREATE TABLE IF NOT EXISTS public.sent_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  offer_id UUID REFERENCES public.offers(id) ON DELETE SET NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  channel TEXT DEFAULT 'whatsapp' CHECK (channel IN ('whatsapp', 'email')),
  message_content TEXT,
  template_id TEXT,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sent_messages_campaign ON public.sent_messages(campaign_id);
CREATE INDEX IF NOT EXISTS idx_sent_messages_client ON public.sent_messages(client_id);
CREATE INDEX IF NOT EXISTS idx_sent_messages_profile ON public.sent_messages(profile_id);
CREATE INDEX IF NOT EXISTS idx_sent_messages_sent_at ON public.sent_messages(sent_at);
