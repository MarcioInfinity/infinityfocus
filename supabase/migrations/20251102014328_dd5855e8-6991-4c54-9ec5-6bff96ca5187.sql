-- ============================================
-- MIGRATION: Correção de Security Warnings
-- Objetivo: Corrigir search_path em funções
-- ============================================

-- Recriar função auto_claim_rewards com search_path
CREATE OR REPLACE FUNCTION public.auto_claim_rewards()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF (NEW.status = 'done' OR NEW.status = 'completed')
  AND (OLD.status IS NULL OR (OLD.status != 'done' AND OLD.status != 'completed')) THEN
    UPDATE
      public.rewards
    SET
      is_claimed = true,
      claimed_at = now(),
      updated_at = now()
    WHERE
      attributed_to_id = NEW.id
      AND attributed_to_type = TG_ARGV [0]
      AND user_id = NEW.user_id
      AND is_claimed = false;
    INSERT INTO
      public.reward_claims (reward_id, user_id, notes)
    SELECT
      r.id,
      r.user_id,
      'Automatically claimed when ' || TG_ARGV [0] || ' was completed'
    FROM
      public.rewards r
    WHERE
      r.attributed_to_id = NEW.id
      AND r.attributed_to_type = TG_ARGV [0]
      AND r.user_id = NEW.user_id
      AND r.is_claimed = true
      AND r.claimed_at = now();
  END IF;
  RETURN NEW;
END;
$function$;

-- Recriar função get_user_rewards com search_path
CREATE OR REPLACE FUNCTION public.get_user_rewards(p_user_id uuid DEFAULT auth.uid())
RETURNS TABLE(
  id uuid, 
  title character varying, 
  description text, 
  celebration_level character varying, 
  investment_value numeric, 
  currency character varying, 
  attributed_to_type character varying, 
  attributed_to_id uuid, 
  attributed_item_name text, 
  is_claimed boolean, 
  claimed_at timestamp with time zone, 
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.title,
    r.description,
    r.celebration_level,
    r.investment_value,
    r.currency,
    r.attributed_to_type,
    r.attributed_to_id,
    CASE
      WHEN r.attributed_to_type = 'task' THEN (
        SELECT
          t.title
        FROM
          public.tasks t
        WHERE
          t.id = r.attributed_to_id
      )
      WHEN r.attributed_to_type = 'project' THEN (
        SELECT
          p.name
        FROM
          public.projects p
        WHERE
          p.id = r.attributed_to_id
      )
      WHEN r.attributed_to_type = 'goal' THEN (
        SELECT
          g.name
        FROM
          public.goals g
        WHERE
          g.id = r.attributed_to_id
      )
      ELSE
        'Unknown'
    END AS attributed_item_name,
    r.is_claimed,
    r.claimed_at,
    r.created_at
  FROM
    public.rewards r
  WHERE
    r.user_id = p_user_id
  ORDER BY
    r.created_at DESC;
END;
$function$;

-- handle_new_user já está correto com set search_path

-- ============================================
-- FIM DA MIGRATION DE CORREÇÃO
-- ============================================