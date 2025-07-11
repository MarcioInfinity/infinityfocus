
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/types';
import { useAuth } from './useAuth';
import { useToastNotifications } from './use-toast-notifications';

export function useProjects() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useToastNotifications();

  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_members (
            id,
            user_id,
            role,
            joined_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        throw error;
      }

      // Fetch profiles separately for each project member
      const projectsWithMembers = await Promise.all(
        data.map(async (project) => {
          const membersWithProfiles = await Promise.all(
            project.project_members.map(async (member) => {
              const { data: profile } = await supabase
                .from('profiles')
                .select('name, email, avatar')
                .eq('user_id', member.user_id)
                .single();

              return {
                id: member.id,
                user_id: member.user_id,
                project_id: project.id,
                role: member.role,
                joined_at: member.joined_at,
                user: {
                  id: member.user_id,
                  name: profile?.name || 'Unknown',
                  email: profile?.email || '',
                  avatar: profile?.avatar
                }
              };
            })
          );

          return {
            ...project,
            members: membersWithProfiles,
            tasks: [] // Will be populated separately when needed
          };
        })
      );

      return projectsWithMembers as Project[];
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
      showErrorToast('Erro ao criar projeto', 'Tente novamente mais tarde.');
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Project> }) => {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
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
        .eq('id', id);

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
