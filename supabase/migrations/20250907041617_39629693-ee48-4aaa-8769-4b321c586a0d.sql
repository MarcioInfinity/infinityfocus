-- Sistema de Recompensas - Recriação completa
-- Remover objetos existentes (se houver)
DROP TRIGGER IF EXISTS auto_claim_task_rewards ON public.tasks;
DROP TRIGGER IF EXISTS auto_claim_project_rewards ON public.projects;
DROP TRIGGER IF EXISTS auto_claim_goal_rewards ON public.goals;
DROP FUNCTION IF EXISTS public.auto_claim_rewards() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_rewards(UUID) CASCADE;
DROP VIEW IF EXISTS public.reward_stats;
DROP TABLE IF EXISTS public.reward_claims;
DROP TABLE IF EXISTS public.rewards;

-- Criar tabela de recompensas
CREATE TABLE IF NOT EXISTS public.rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  celebration_level VARCHAR(50) NOT NULL CHECK (celebration_level IN (
    'small',
    'medium',
    'large',
    'epic'
  )),
  investment_value DECIMAL(10,2),
  currency VARCHAR(10) DEFAULT 'BRL',
  attributed_to_type VARCHAR(20) NOT NULL CHECK (attributed_to_type IN (
    'task',
    'project',
    'goal'
  )),
  attributed_to_id UUID NOT NULL,
  attributed_item_name TEXT,
  is_claimed BOOLEAN DEFAULT false,
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Adicionar RLS e políticas
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own rewards" ON public.rewards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own rewards" ON public.rewards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own rewards" ON public.rewards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own rewards" ON public.rewards FOR DELETE USING (auth.uid() = user_id);

-- Criar índices
CREATE INDEX idx_rewards_user_id ON public.rewards (user_id);
CREATE INDEX idx_rewards_attributed_to ON public.rewards (attributed_to_type, attributed_to_id);
CREATE INDEX idx_rewards_claimed ON public.rewards (is_claimed);

-- Criar tabela de reivindicações
CREATE TABLE IF NOT EXISTS public.reward_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reward_id UUID NOT NULL REFERENCES public.rewards (id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Adicionar RLS para reward_claims
ALTER TABLE public.reward_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own reward claims" ON public.reward_claims FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own reward claims" ON public.reward_claims FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Criar função para reivindicação automática
CREATE OR REPLACE FUNCTION public.auto_claim_rewards()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $$
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
$$;

-- Criar view de estatísticas
CREATE OR REPLACE VIEW public.reward_stats AS
SELECT
  user_id,
  COUNT(*) AS total_rewards,
  COUNT(CASE WHEN is_claimed THEN 1 END) AS claimed_rewards,
  COUNT(CASE WHEN NOT is_claimed THEN 1 END) AS pending_rewards,
  SUM(CASE WHEN is_claimed THEN investment_value ELSE 0 END) AS total_claimed_value,
  SUM(CASE WHEN NOT is_claimed THEN investment_value ELSE 0 END) AS total_pending_value,
  AVG(investment_value) AS avg_reward_value
FROM
  public.rewards
GROUP BY
  user_id;

GRANT SELECT ON public.reward_stats TO authenticated;
ALTER VIEW public.reward_stats SET (security_invoker = true);

-- Criar função para buscar recompensas do usuário
CREATE OR REPLACE FUNCTION public.get_user_rewards(p_user_id UUID DEFAULT auth.uid())
  RETURNS TABLE (
    id UUID,
    title VARCHAR,
    description TEXT,
    celebration_level VARCHAR,
    investment_value DECIMAL,
    currency VARCHAR,
    attributed_to_type VARCHAR,
    attributed_to_id UUID,
    attributed_item_name TEXT,
    is_claimed BOOLEAN,
    claimed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE
  )
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $$
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
$$;

GRANT EXECUTE ON FUNCTION public.get_user_rewards TO authenticated;