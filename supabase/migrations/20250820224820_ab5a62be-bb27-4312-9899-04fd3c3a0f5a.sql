-- Corrigindo as funções restantes com search_path vulnerável
-- Função 5: drop_all_policies_on_table
CREATE OR REPLACE FUNCTION public.drop_all_policies_on_table(p_schema_name text, p_table_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $function$
DECLARE
    policy_record record;
BEGIN
    FOR policy_record IN 
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = p_schema_name AND tablename = p_table_name
    LOOP
        EXECUTE format(
            'DROP POLICY IF EXISTS %I ON %I.%I;',
            policy_record.policyname,
            p_schema_name,
            p_table_name
        );
    END LOOP;
END;
$function$;

-- Função 6: create_project_safe
CREATE OR REPLACE FUNCTION public.create_project_safe(p_name text, p_owner_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $function$
DECLARE
  new_id uuid;
BEGIN
  INSERT INTO public.projects (name, owner_id)
  VALUES (p_name, p_owner_id)
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$function$;

-- Função 7: get_user_rewards
CREATE OR REPLACE FUNCTION public.get_user_rewards(p_user_id uuid DEFAULT auth.uid())
RETURNS TABLE(id uuid, title character varying, description text, celebration_level character varying, investment_value numeric, currency character varying, attributed_to_type character varying, attributed_to_id uuid, attributed_item_name text, is_claimed boolean, claimed_at timestamp with time zone, created_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
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