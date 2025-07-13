
-- FASE 1: CORREÇÃO DAS POLICIES RLS
-- Remover policies problemáticas e criar novas simples

-- 1. Corrigir policies de project_members
DROP POLICY IF EXISTS "Project owners and admins can manage members" ON public.project_members;
DROP POLICY IF EXISTS "Users can view project members of projects they have access to" ON public.project_members;

CREATE POLICY "Users can manage project members where they are owner" 
ON public.project_members 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = project_members.project_id 
    AND projects.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can view project members of their projects" 
ON public.project_members 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = project_members.project_id 
    AND projects.owner_id = auth.uid()
  ) 
  OR project_members.user_id = auth.uid()
);

-- 2. Corrigir policies de projects
DROP POLICY IF EXISTS "Project owners and admins can update projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view projects they own or are members of" ON public.projects;

CREATE POLICY "Users can update their own projects" 
ON public.projects 
FOR UPDATE 
USING (auth.uid() = owner_id);

CREATE POLICY "Users can view their own projects and projects they are members of" 
ON public.projects 
FOR SELECT 
USING (
  auth.uid() = owner_id 
  OR EXISTS (
    SELECT 1 FROM public.project_members 
    WHERE project_members.project_id = projects.id 
    AND project_members.user_id = auth.uid()
  )
);

-- 3. Corrigir policies de kanban_columns
DROP POLICY IF EXISTS "Project owners and admins can manage kanban columns" ON public.kanban_columns;
DROP POLICY IF EXISTS "Users can view kanban columns of projects they have access to" ON public.kanban_columns;

CREATE POLICY "Users can manage kanban columns of their projects" 
ON public.kanban_columns 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = kanban_columns.project_id 
    AND projects.owner_id = auth.uid()
  )
);

CREATE POLICY "Users can view kanban columns of accessible projects" 
ON public.kanban_columns 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE projects.id = kanban_columns.project_id 
    AND (
      projects.owner_id = auth.uid() 
      OR EXISTS (
        SELECT 1 FROM public.project_members 
        WHERE project_members.project_id = projects.id 
        AND project_members.user_id = auth.uid()
      )
    )
  )
);

-- 4. Corrigir policy de custom_notifications para incluir user_id
DROP POLICY IF EXISTS "Users can manage custom notifications of their tasks" ON public.custom_notifications;

CREATE POLICY "Users can manage their custom notifications" 
ON public.custom_notifications 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.id = custom_notifications.task_id 
    AND tasks.created_by = auth.uid()
  )
);

-- 5. Adicionar coluna user_id na tabela custom_notifications se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'custom_notifications' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.custom_notifications ADD COLUMN user_id UUID REFERENCES auth.users(id);
    
    -- Atualizar registros existentes
    UPDATE public.custom_notifications 
    SET user_id = (
      SELECT tasks.created_by 
      FROM public.tasks 
      WHERE tasks.id = custom_notifications.task_id
    );
    
    -- Tornar coluna obrigatória
    ALTER TABLE public.custom_notifications ALTER COLUMN user_id SET NOT NULL;
  END IF;
END $$;

-- 6. Criar policy mais simples para custom_notifications
DROP POLICY IF EXISTS "Users can manage their custom notifications" ON public.custom_notifications;

CREATE POLICY "Users can manage their own custom notifications" 
ON public.custom_notifications 
FOR ALL 
USING (auth.uid() = user_id);

-- 7. Garantir que task_id pode ser NULL para notificações gerais
ALTER TABLE public.custom_notifications ALTER COLUMN task_id DROP NOT NULL;
