
-- Verificar e adicionar campos necessários para repetição de tarefas
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS monthly_day INTEGER CHECK (monthly_day >= 1 AND monthly_day <= 31);

ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS custom_dates DATE[] DEFAULT NULL;

-- Verificar se a tabela rewards tem todos os campos necessários
ALTER TABLE public.rewards 
ADD COLUMN IF NOT EXISTS attributed_item_name TEXT;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_tasks_repeat_enabled ON public.tasks(repeat_enabled);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_repeat_type ON public.tasks(repeat_type);
