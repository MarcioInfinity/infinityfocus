
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToastNotifications } from './use-toast-notifications';
import { Project } from '@/types';

export function useProjects() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useToastNotifications();

  const projectsQuery = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        throw error;
      }

      return data as Project[];
    },
    enabled: !!user,
  });

  const createProjectMutation = useMutation({
    mutationFn: async (projectData: Partial<Project>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('projects')
        .insert({
          name: projectData.name!,
          description: projectData.description,
          priority: projectData.priority || 'medium',
          category: projectData.category || 'professional',
          color: projectData.color || '#3B82F6',
          is_shared: projectData.is_shared || false,
          start_date: projectData.start_date,
          due_date: projectData.due_date,
          is_indefinite: projectData.is_indefinite || false,
          start_time: projectData.start_time,
          end_time: projectData.end_time,
          notifications_enabled: projectData.notifications_enabled || false,
          repeat_enabled: projectData.repeat_enabled || false,
          repeat_type: projectData.repeat_type,
          repeat_days: projectData.repeat_days,
          owner_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      showSuccessToast('Projeto criado com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating project:', error);
      showErrorToast('Erro ao criar projeto');
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Project> }) => {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .eq('owner_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      showSuccessToast('Projeto atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating project:', error);
      showErrorToast('Erro ao atualizar projeto');
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('owner_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      showSuccessToast('Projeto excluído com sucesso!');
    },
    onError: (error) => {
      console.error('Error deleting project:', error);
      showErrorToast('Erro ao excluir projeto');
    },
  });

  return {
    projects: projectsQuery.data || [],
    isLoading: projectsQuery.isLoading,
    error: projectsQuery.error,
    createProject: createProjectMutation.mutate,
    updateProject: updateProjectMutation.mutate,
    deleteProject: deleteProjectMutation.mutate,
    isCreating: createProjectMutation.isPending,
    isUpdating: updateProjectMutation.isPending,
    isDeleting: deleteProjectMutation.isPending,
  };
}
