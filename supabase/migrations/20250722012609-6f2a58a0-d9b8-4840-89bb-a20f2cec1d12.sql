
-- Verificar se a tabela rewards precisa de ajustes
-- Adicionar campos que podem estar faltando na tabela rewards
ALTER TABLE public.rewards 
ADD COLUMN IF NOT EXISTS attributed_item_name TEXT;

-- Verificar se a tabela tasks tem todos os campos necessários para repetição mensal
-- O campo monthly_day já existe mas vamos garantir que está correto
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS monthly_day INTEGER CHECK (monthly_day >= 1 AND monthly_day <= 31);

-- Criar índices para melhor performance nas consultas de recompensas
CREATE INDEX IF NOT EXISTS idx_rewards_user_id ON public.rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_rewards_attributed_to ON public.rewards(attributed_to_type, attributed_to_id);

-- Garantir que a função get_user_rewards está otimizada
-- (A função já existe, apenas verificando se está funcionando corretamente)
