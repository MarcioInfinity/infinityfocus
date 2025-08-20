import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/types';
import { toast } from 'sonner';

export function useProjects() {
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar projetos:', error);
        throw error;
      }
      
      // Retornar dados mapeados corretamente
      return (data || []).map(project => ({
        ...project,
        members: [],
        tasks: [],
        checklist: [],
        owner_id: project.owner_id,
      }));
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const createProject = useMutation({
    mutationFn: async (projectData: Partial<Project>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const projectToCreate = {
        name: projectData.name || '',
        owner_id: user.id,
        user_id: user.id,
        priority: projectData.priority || 'medium',
        category: projectData.category || 'professional',
        color: projectData.color || '#3B82F6',
        is_shared: projectData.is_shared || false,
        notifications_enabled: projectData.notifications_enabled || false,
        repeat_enabled: projectData.repeat_enabled || false,
        start_time: projectData.start_time || null,
        end_time: projectData.end_time || null,
        ...projectData,
      };

      const { data, error } = await supabase
        .from('projects')
        .insert(projectToCreate)
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar projeto:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Projeto criado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar projeto:', error);
      toast.error('Erro ao criar projeto. Tente novamente.');
    },
  });

  const updateProject = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Project> }) => {
      // Mapear campos corretamente
      const mappedUpdates = {
        ...updates,
        start_time: updates.start_time || null,
        end_time: updates.end_time || null,
      };

      const { data, error } = await supabase
        .from('projects')
        .update(mappedUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar projeto:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Projeto atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar projeto:', error);
      toast.error('Erro ao atualizar projeto. Tente novamente.');
    },
  });

  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir projeto:', error);
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Projeto excluído com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao excluir projeto:', error);
      toast.error('Erro ao excluir projeto. Tente novamente.');
    },
  });

  const toggleProjectComplete = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { data, error } = await supabase
        .from('projects')
        .update({ 
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao alterar status do projeto:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Status do projeto atualizado!');
    },
    onError: (error) => {
      console.error('Erro ao alterar status do projeto:', error);
      toast.error('Erro ao alterar status do projeto. Tente novamente.');
    },
  });

  return {
    projects,
    isLoading,
    error,
    createProject: createProject.mutate,
    updateProject: updateProject.mutate,
    deleteProject: deleteProject.mutate,
    toggleProjectComplete: toggleProjectComplete.mutate,
    isCreating: createProject.isPending,
    isUpdating: updateProject.isPending,
    isDeleting: deleteProject.isPending,
    isToggling: toggleProjectComplete.isPending,
  };
}
