-- Migration 017: Add updated_at trigger for clients table + remove overly permissive demo policy

-- Trigger function to auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION update_clients_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on clients table
CREATE TRIGGER trigger_clients_timestamp
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION update_clients_timestamp();

-- Remove overly permissive demo policy on message_templates
-- The "Service role bypass" policy already handles demo mode (Edge Functions use service role)
DROP POLICY IF EXISTS "Demo mode access" ON public.message_templates;
