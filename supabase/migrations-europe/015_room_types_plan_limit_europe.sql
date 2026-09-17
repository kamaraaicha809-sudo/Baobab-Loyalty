-- Migration 015 (Europe) : corrige la limite de chambres par plan.
--
-- La fonction enforce_room_types_limit() existe deja sur la base Europe
-- (copiee telle quelle depuis Afrique lors de la creation du projet), mais
-- ne connait que les slugs Afrique (pro/premium/croissance) : un compte
-- Europe Professional ou Business retombait donc sur la limite par defaut
-- de 30 chambres au lieu de 100/illimite. Cette migration remplace la
-- fonction avec les slugs Europe (voir config.js billing.plansEurope).
-- Le trigger trg_enforce_room_types_limit existant reste inchange (il
-- pointe deja vers cette fonction par son nom).

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

  -- Doit rester synchronise avec config.js (billing.plansEurope[].maxRooms)
  v_max_rooms := CASE lower(COALESCE(v_price_id, 'starter'))
    WHEN 'business' THEN NULL
    WHEN 'professional' THEN 100
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
