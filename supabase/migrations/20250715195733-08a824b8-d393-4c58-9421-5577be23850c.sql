
-- Diagnóstico e correção das políticas RLS para compartilhamento de projetos

-- 1. Corrigir políticas de projects para incluir membros
DROP POLICY IF EXISTS "projects_select_policy" ON public.projects;
DROP POLICY IF EXISTS "projects_update_policy" ON public.projects;
DROP POLICY IF EXISTS "projects_delete_policy" ON public.projects;
DROP POLICY IF EXISTS "projects_insert_policy" ON public.projects;

-- Políticas corrigidas para projects
CREATE POLICY "Users can view projects they own or are members of" 
ON public.projects 
FOR SELECT 
USING (
  auth.uid() = owner_id 
  OR auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM public.project_members 
    WHERE project_members.project_id = projects.id 
    AND project_members.user_id = auth.uid()
  )
);

CREATE POLICY "Project owners can update projects" 
ON public.projects 
FOR UPDATE 
USING (auth.uid() = owner_id OR auth.uid() = user_id);

CREATE POLICY "Project owners can delete projects" 
ON public.projects 
FOR DELETE 
USING (auth.uid() = owner_id);

CREATE POLICY "Authenticated users can create projects" 
ON public.projects 
FOR INSERT 
WITH CHECK (auth.uid() = owner_id AND (user_id IS NULL OR auth.uid() = user_id));

-- 2. Corrigir políticas de tasks para incluir membros do projeto
DROP POLICY IF EXISTS "tasks_select_policy" ON public.tasks;
DROP POLICY IF EXISTS "tasks_update_policy" ON public.tasks;
DROP POLICY IF EXISTS "tasks_delete_policy" ON public.tasks;
DROP POLICY IF EXISTS "tasks_insert_policy" ON public.tasks;

-- Políticas corrigidas para tasks
CREATE POLICY "Users can view tasks from accessible projects" 
ON public.tasks 
FOR SELECT 
USING (
  auth.uid() = created_by 
  OR auth.uid() = owner_id 
  OR auth.uid() = user_id
  OR (
    project_id IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = tasks.project_id 
      AND (
        projects.owner_id = auth.uid() 
        OR projects.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.project_members 
          WHERE project_members.project_id = projects.id 
          AND project_members.user_id = auth.uid()
        )
      )
    )
  )
);

CREATE POLICY "Users can update tasks from accessible projects" 
ON public.tasks 
FOR UPDATE 
USING (
  auth.uid() = created_by 
  OR auth.uid() = owner_id 
  OR auth.uid() = user_id
  OR (
    project_id IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = tasks.project_id 
      AND (
        projects.owner_id = auth.uid() 
        OR projects.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.project_members 
          WHERE project_members.project_id = projects.id 
          AND project_members.user_id = auth.uid()
          AND project_members.role IN ('admin', 'member')
        )
      )
    )
  )
);

CREATE POLICY "Users can delete tasks from accessible projects" 
ON public.tasks 
FOR DELETE 
USING (
  auth.uid() = created_by 
  OR auth.uid() = owner_id 
  OR (
    project_id IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = tasks.project_id 
      AND (
        projects.owner_id = auth.uid() 
        OR EXISTS (
          SELECT 1 FROM public.project_members 
          WHERE project_members.project_id = projects.id 
          AND project_members.user_id = auth.uid()
          AND project_members.role IN ('admin')
        )
      )
    )
  )
);

CREATE POLICY "Users can create tasks in accessible projects" 
ON public.tasks 
FOR INSERT 
WITH CHECK (
  auth.uid() = created_by 
  AND (
    project_id IS NULL 
    OR EXISTS (
      SELECT 1 FROM public.projects 
      WHERE projects.id = tasks.project_id 
      AND (
        projects.owner_id = auth.uid() 
        OR projects.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.project_members 
          WHERE project_members.project_id = projects.id 
          AND project_members.user_id = auth.uid()
          AND project_members.role IN ('admin', 'member')
        )
      )
    )
  )
);

-- 3. Habilitar realtime para atualizações em tempo real
ALTER TABLE public.projects REPLICA IDENTITY FULL;
ALTER TABLE public.tasks REPLICA IDENTITY FULL;
ALTER TABLE public.project_members REPLICA IDENTITY FULL;
ALTER TABLE public.project_invites REPLICA IDENTITY FULL;

-- Adicionar tabelas à publicação realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_invites;

-- 4. Criar função para verificar se usuário tem acesso ao projeto
CREATE OR REPLACE FUNCTION public.user_has_project_access(project_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.projects 
    WHERE id = project_id 
    AND (owner_id = user_id OR user_id = user_id)
  ) OR EXISTS (
    SELECT 1 FROM public.project_members 
    WHERE project_id = project_id 
    AND user_id = user_id
  );
$$;
