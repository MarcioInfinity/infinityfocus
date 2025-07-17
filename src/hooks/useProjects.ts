
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToastNotifications } from './use-toast-notifications';
import { Project, ProjectMember, Task, CategoryType } from '@/types';
import { useRealtime } from './useRealtime';
import { toISOStringWithoutTimeZone, formatTime, convertCategoryToEnglish } from '@/lib/utils';

export function useProjects() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useToastNotifications();

  // Habilitar atualizações em tempo real
  useRealtime();

  const projectsQuery = useQuery({
    queryKey: ['projects', user?.id],
    queryFn: async () => {
      if (!user) {
        console.log('User not authenticated, returning empty projects array.');
        return [];
      }
      
      console.log('Attempting to fetch projects for user:', user.id);
      
      // Corrigido: usar owner_id que é o campo correto na tabela projects
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_members (
            id,
            user_id,
            role,
            joined_at,
            project_id
          ),
          tasks (
            id,
            title,
            description,
            priority,
            category,
            status,
            due_date,
            start_date,
            start_time,
            end_time,
            is_indefinite,
            assigned_to,
            project_id,
            goal_id,
            tags,
            notifications_enabled,
            repeat_enabled,
            repeat_type,
            repeat_days,
            created_by,
            created_at,
            updated_at
          )
        `)
        .eq('owner_id', user.id) // Corrigido: usar owner_id em vez de user_id
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects from Supabase:', error);
        throw error;
      }

      console.log('Projects fetched successfully:', data?.length || 0, 'projects.');

      // Transform data to match Project interface
      const transformedProjects: Project[] = (data || []).map(project => {
        const members: ProjectMember[] = (project.project_members || []).map(member => ({
          id: member.id,
          user_id: member.user_id,
          project_id: member.project_id,
          role: member.role,
          joined_at: member.joined_at,
          user: {
            id: member.user_id,
            name: 'User', // This would need to be fetched from profiles if needed
            email: '',
            avatar: undefined
          }
        }));

        // Transform tasks to match Task interface
        const tasks: Task[] = (project.tasks || []).map(task => ({
          ...task,
          checklist: [],
          notifications: [],
          tags: task.tags || []
        }));

        return {
          ...project,
          members,
          tasks,
        } as Project;
      });

      return transformedProjects;
    },
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  });

  const createProjectMutation = useMutation({
    mutationFn: async (projectData: any) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Creating project with data:', projectData);

      // Convert category to English and ensure it's a valid CategoryType
      const validCategory: CategoryType = convertCategoryToEnglish(projectData.category);

      const projectPayload = {
        name: projectData.name,
        description: projectData.description || null,
        priority: projectData.priority || 'medium',
        category: validCategory,
        color: projectData.color || '#3B82F6',
        is_shared: projectData.is_shared || false,
        start_date: projectData.start_date ? toISOStringWithoutTimeZone(new Date(projectData.start_date)) : null,
        due_date: projectData.due_date ? toISOStringWithoutTimeZone(new Date(projectData.due_date)) : null,
        is_indefinite: projectData.is_indefinite || false,
        start_time: projectData.start_time ? formatTime(projectData.start_time) : null,
        end_time: projectData.end_time ? formatTime(projectData.end_time) : null,
        notifications_enabled: projectData.notifications_enabled || false,
        repeat_enabled: projectData.repeat_enabled || false,
        repeat_type: projectData.repeat_type || null,
        repeat_days: projectData.repeat_days ? projectData.repeat_days.map(String) : null,
        owner_id: user.id, // Corrigido: usar apenas owner_id
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
      // Corrigido: invalidar com a queryKey específica do usuário
      queryClient.invalidateQueries({ queryKey: ['projects', user?.id] });
      showSuccessToast('Projeto criado com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating project:', error);
      showErrorToast('Erro ao criar projeto: ' + error.message);
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Project> }) => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('Updating project:', id, updates);

      // Convert category to English and ensure it's a valid CategoryType
      const validCategory: CategoryType | undefined = updates.category ? convertCategoryToEnglish(updates.category) : updates.category;

      const updatedPayload: any = {
        ...updates,
        category: validCategory,
        start_date: updates.start_date ? toISOStringWithoutTimeZone(new Date(updates.start_date)) : updates.start_date,
        due_date: updates.due_date ? toISOStringWithoutTimeZone(new Date(updates.due_date)) : updates.due_date,
        start_time: updates.start_time ? formatTime(updates.start_time) : updates.start_time,
        end_time: updates.end_time ? formatTime(updates.end_time) : updates.end_time,
      };
      
      const { data, error } = await supabase
        .from('projects')
        .update(updatedPayload)
        .eq('id', id)
        .eq('owner_id', user.id) // Corrigido: adicionar verificação de owner_id para segurança
        .select()
        .single();

      if (error) {
        console.error('Error updating project:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: (data, variables) => {
      // Corrigido: invalidar com a queryKey específica do usuário
      queryClient.invalidateQueries({ queryKey: ['projects', user?.id] });
      
      // Optimistic update
      queryClient.setQueryData(['projects', user?.id], (old: Project[] | undefined) => {
        if (!old) return old;
        return old.map(project => 
          project.id === variables.id ? { ...project, ...variables.updates } : project
        );
      });
      
      showSuccessToast('Projeto atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating project:', error);
      showErrorToast('Erro ao atualizar projeto: ' + error.message);
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('owner_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      // Corrigido: invalidar com a queryKey específica do usuário
      queryClient.invalidateQueries({ queryKey: ['projects', user?.id] });
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
