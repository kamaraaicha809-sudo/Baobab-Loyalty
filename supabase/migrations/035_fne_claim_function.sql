-- Migration 035: fonction de claim atomique pour fne-worker
-- Une seule facture QUEUED reclamee a la fois, verrouillage FOR UPDATE SKIP LOCKED,
-- pour garantir la concurrence 1 exigee par la spec (une seule requete /sign en vol
-- pour tout le systeme - la serie de numerotation FNE est unique par entreprise).

CREATE OR REPLACE FUNCTION fne_claim_next_invoice()
RETURNS invoices
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  claimed invoices;
BEGIN
  UPDATE invoices
  SET state = 'SENDING', attempt_count = attempt_count + 1
  WHERE id = (
    SELECT id FROM invoices
    WHERE state = 'QUEUED' AND next_attempt_at <= now()
    ORDER BY created_at
    FOR UPDATE SKIP LOCKED
    LIMIT 1
  )
  RETURNING * INTO claimed;

  RETURN claimed; -- NULL si aucune facture a traiter
END;
$$;

REVOKE EXECUTE ON FUNCTION fne_claim_next_invoice() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION fne_claim_next_invoice() TO service_role;
