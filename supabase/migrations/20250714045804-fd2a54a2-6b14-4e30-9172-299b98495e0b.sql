
-- Criar tabela para tokens de convite de projetos
CREATE TABLE public.project_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  token TEXT NOT NULL UNIQUE,
  email TEXT,
  role project_role NOT NULL DEFAULT 'member',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  used_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar RLS
ALTER TABLE public.project_invites ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para project_invites
CREATE POLICY "Project owners can manage invites" 
  ON public.project_invites 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = project_invites.project_id 
    AND projects.owner_id = auth.uid()
  ));

CREATE POLICY "Anyone can view valid invites for joining" 
  ON public.project_invites 
  FOR SELECT 
  TO authenticated
  USING (expires_at > now() AND used_at IS NULL);

-- Trigger para updated_at
CREATE TRIGGER project_invites_updated_at
  BEFORE UPDATE ON public.project_invites
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
