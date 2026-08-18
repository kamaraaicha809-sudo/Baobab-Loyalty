-- La limite de chambres par plan (30 Starter / 60 Pro / illimité Premium)
-- n'existait que dans la grille tarifaire affichée : rien n'empêchait un
-- hôtel Starter de saisir techniquement plus de 30 chambres. room_types est
-- écrit directement depuis le frontend via RLS (pas d'Edge Function), donc
-- la seule façon fiable d'appliquer cette limite est un trigger côté base.

CREATE OR REPLACE FUNCTION public.enforce_room_types_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_price_id TEXT;
  v_max_rooms INTEGER;
  v_current_total INTEGER;
BEGIN
  SELECT price_id INTO v_price_id FROM public.profiles WHERE id = NEW.profile_id;

  -- Doit rester synchronisé avec config.js (billing.plans[].maxRooms)
  v_max_rooms := CASE lower(COALESCE(v_price_id, 'starter'))
    WHEN 'premium' THEN NULL
    WHEN 'pro' THEN 60
    WHEN 'croissance' THEN 60
    ELSE 30
  END;

  IF v_max_rooms IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(SUM(nombre_chambres), 0) INTO v_current_total
  FROM public.room_types
  WHERE profile_id = NEW.profile_id
    AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

  IF v_current_total + COALESCE(NEW.nombre_chambres, 0) > v_max_rooms THEN
    RAISE EXCEPTION 'Limite de % chambres atteinte pour votre plan actuel.', v_max_rooms
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_room_types_limit ON public.room_types;
CREATE TRIGGER trg_enforce_room_types_limit
  BEFORE INSERT OR UPDATE ON public.room_types
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_room_types_limit();
