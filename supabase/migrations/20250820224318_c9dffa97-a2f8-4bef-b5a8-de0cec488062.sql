-- Corrigindo funções com search_path vulnerável para segurança
-- Função 1: handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.email
  );
  
  INSERT INTO public.notification_settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$function$;

-- Função 2: update_updated_at_column  
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

-- Função 3: auto_claim_rewards
CREATE OR REPLACE FUNCTION public.auto_claim_rewards()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $function$
BEGIN
  -- Check if the status changed to 'done' or 'completed'
  IF (NEW.status = 'done' OR NEW.status = 'completed')
  AND (OLD.status IS NULL OR (OLD.status != 'done' AND OLD.status != 'completed')) THEN
    -- Find and claim associated rewards
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
    -- Insert claim records
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

-- Função 4: handle_updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;