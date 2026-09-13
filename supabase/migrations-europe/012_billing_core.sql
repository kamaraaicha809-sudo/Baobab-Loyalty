-- Billing Core Europe (Phase 6) : abonnements, factures, idempotence
-- webhook, catalogue de prix configurable. Aucun paiement reel possible tant
-- que STRIPE_SECRET_KEY_TEST n'est pas configure (voir _shared/billing-core/
-- stripe-adapter.ts) -- Moneroo (Afrique) n'est jamais touche, aucune de ces
-- tables n'existe sur le projet Afrique.

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'stripe',
  provider_customer_id TEXT,
  provider_subscription_id TEXT UNIQUE,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'incomplete' CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'incomplete', 'incomplete_expired', 'unpaid')),
  trial_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_provider_customer ON public.subscriptions(provider_customer_id) WHERE provider_customer_id IS NOT NULL;

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Team admins view own subscription" ON public.subscriptions;
CREATE POLICY "Team admins view own subscription" ON public.subscriptions
  FOR SELECT USING (public.is_team_admin(profile_id));
DROP POLICY IF EXISTS "Service role manages subscriptions" ON public.subscriptions;
CREATE POLICY "Service role manages subscriptions" ON public.subscriptions
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  provider_invoice_id TEXT UNIQUE,
  amount_excl_tax_cents INTEGER NOT NULL,
  tax_rate_bps INTEGER NOT NULL DEFAULT 0,
  tax_amount_cents INTEGER NOT NULL DEFAULT 0,
  amount_incl_tax_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'eur',
  country_code TEXT,
  customer_type TEXT CHECK (customer_type IN ('b2b', 'b2c')),
  vat_number TEXT,
  reverse_charge BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),
  invoice_pdf_url TEXT,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoices_profile ON public.invoices(profile_id, created_at DESC);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Team admins view own invoices" ON public.invoices;
CREATE POLICY "Team admins view own invoices" ON public.invoices
  FOR SELECT USING (public.is_team_admin(profile_id));
DROP POLICY IF EXISTS "Service role manages invoices" ON public.invoices;
CREATE POLICY "Service role manages invoices" ON public.invoices
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1
);

ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Team admins view own invoice items" ON public.invoice_items;
CREATE POLICY "Team admins view own invoice items" ON public.invoice_items
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.invoices i WHERE i.id = invoice_id AND public.is_team_admin(i.profile_id)));
DROP POLICY IF EXISTS "Service role manages invoice items" ON public.invoice_items;
CREATE POLICY "Service role manages invoice items" ON public.invoice_items
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- Idempotence webhook : Stripe peut renvoyer le meme evenement plusieurs
-- fois (retries reseau, replays manuels) -- event_id unique empeche tout
-- traitement en double (double credit d'acces, facture dupliquee...).
CREATE TABLE IF NOT EXISTS public.billing_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (provider, event_id)
);

ALTER TABLE public.billing_webhook_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role manages webhook events" ON public.billing_webhook_events;
CREATE POLICY "Service role manages webhook events" ON public.billing_webhook_events
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- Catalogue de prix configurable (jamais code en dur dans le frontend).
-- monthly_relances/max_rooms/max_team_members volontairement NULL : seuls
-- les PRIX ont ete valides explicitement par l'utilisatrice, pas encore le
-- decoupage des fonctionnalites par plan -- status='draft' tant que ce
-- decoupage n'est pas confirme.
CREATE TABLE IF NOT EXISTS public.plan_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  price_excl_tax_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'eur',
  monthly_relances INTEGER,
  max_rooms INTEGER,
  max_team_members INTEGER,
  trial_days INTEGER NOT NULL DEFAULT 14,
  stripe_price_id TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'validated')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.plan_prices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read active plan prices" ON public.plan_prices;
CREATE POLICY "Anyone can read active plan prices" ON public.plan_prices
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "Service role manages plan prices" ON public.plan_prices;
CREATE POLICY "Service role manages plan prices" ON public.plan_prices
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

COMMENT ON TABLE public.plan_prices IS
  'Source de verite des prix Europe, cote serveur uniquement -- jamais recalcule depuis une valeur envoyee par le frontend. Prix HT valides (79/149/349 EUR) ; quotas de fonctionnalites (monthly_relances/max_rooms/max_team_members) restent NULL/draft tant que non confirmes.';

INSERT INTO public.plan_prices (plan_id, name, price_excl_tax_cents, trial_days, status)
VALUES
  ('starter', 'Starter', 7900, 14, 'draft'),
  ('professional', 'Professional', 14900, 14, 'draft'),
  ('business', 'Business', 34900, 14, 'draft')
ON CONFLICT (plan_id) DO NOTHING;
