-- Migration 031: Essai gratuit de 30 jours pour les nouveaux hoteliers
-- Les comptes existants (has_access = true) ne sont pas affectes.
-- Les nouveaux comptes demarrent sans acces paye mais avec un essai de 30 jours.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;

ALTER TABLE profiles
  ALTER COLUMN has_access SET DEFAULT false;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, hotel_name, config_complete, has_access, trial_ends_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'hotel_name', ''),
    false,
    false,
    now() + interval '30 days'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$function$;
