
-- Adicionar tabela para configurações de usuário (fuso horário, data e horário)
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  date_format TEXT DEFAULT 'DD/MM/YYYY',
  time_format TEXT DEFAULT '24h',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Habilitar RLS na tabela user_settings
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Criar políticas para user_settings
CREATE POLICY "Users can view their own settings" 
  ON public.user_settings 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" 
  ON public.user_settings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" 
  ON public.user_settings 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Adicionar campo invite_link à tabela project_invites se não existir
ALTER TABLE public.project_invites 
ADD COLUMN IF NOT EXISTS invite_link TEXT;

-- Corrigir as políticas da tabela project_invites
DROP POLICY IF EXISTS "Project owners can manage invites" ON public.project_invites;
CREATE POLICY "Project owners can manage invites" 
  ON public.project_invites 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = project_invites.project_id 
    AND projects.owner_id = auth.uid()
  ));

-- Adicionar trigger para updated_at em user_settings
CREATE OR REPLACE TRIGGER user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);

-- Habilitar realtime para user_settings
ALTER TABLE public.user_settings REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_settings;
