-- ============================================
-- Newsletter Subscribers Table
-- Stores emails from the public website newsletter form
-- No user_id: public subscription, managed by service role only
-- ============================================

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  source text DEFAULT 'website',
  created_at timestamptz DEFAULT now(),
  unsubscribed_at timestamptz
);

-- RLS: only service role can access (admin data)
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only" ON newsletter_subscribers
  FOR ALL USING (false);

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_status ON newsletter_subscribers(status);
