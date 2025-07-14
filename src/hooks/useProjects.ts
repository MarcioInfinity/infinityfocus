
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
    mutationFn: async (projectData: any) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Creating project with data:', projectData);

      const projectPayload = {
        name: projectData.name,
        description: projectData.description,
        priority: projectData.priority || 'medium',
        category: projectData.category || 'professional',
        color: projectData.color || '#3B82F6',
        is_shared: projectData.is_shared || false,
        start_date: projectData.start_date || null, // Converter string vazia para null
        due_date: projectData.due_date || null, // Converter string vazia para null
        is_indefinite: projectData.is_indefinite || false,
        start_time: projectData.time || null, // Mapear 'time' para 'start_time' e converter string vazia para null
        end_time: projectData.end_time || null, // Converter string vazia para null
        notifications_enabled: projectData.notify_enabled || false, // Corrigir mapeamento
        repeat_enabled: projectData.frequency_enabled || false, // Corrigir mapeamento
        repeat_type: projectData.frequency_type || null, // Corrigir mapeamento e converter string vazia para null
        repeat_days: projectData.frequency_days ? projectData.frequency_days.map(String) : null, // Converter para string array
        user_id: user.id, // Usar user_id em vez de owner_id
        owner_id: user.id, // Adicionar owner_id também para compatibilidade
      };

      console.log('Project payload:', projectPayload);

      const { data, error } = await supabase
        .from('projects')
        .insert(projectPayload)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      showSuccessToast('Projeto criado com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating project:', error);
      showErrorToast('Erro ao criar projeto: ' + error.message);
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
