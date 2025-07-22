import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToastNotifications } from './use-toast-notifications';
import { Goal } from '@/types';

export function useGoals(projectId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useToastNotifications();

  const goalsQuery = useQuery({
    queryKey: [projectId ? 'projectGoals' : 'goals', user?.id, projectId],
    queryFn: async () => {
      if (!user) return [];
      
      console.log(`Fetching ${projectId ? 'project goals' : 'goals'} for user:`, user.id, projectId ? `(Project ID: ${projectId})` : '');
      
      let query = supabase
        .from(projectId ? 'project_goals' : 'goals')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;

      if (error) {
        console.error(`Error fetching ${projectId ? 'project goals' : 'goals'}:`, error);
        throw error;
      }

      console.log(`${projectId ? 'Project goals' : 'Goals'} fetched:`, data?.length || 0);

      return (data || []) as Goal[];
    },
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  });

  const createGoalMutation = useMutation({
    mutationFn: async (goalData: any) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Creating goal with data:', goalData);

      const goalPayload = {
        name: goalData.name,
        description: goalData.description || null,
        priority: goalData.priority || 'medium',
        category: goalData.category || 'professional',
        start_date: goalData.start_date || null,
        due_date: goalData.due_date || null,
        progress: goalData.progress || 0,
        is_shared: goalData.is_shared || false,
        notifications_enabled: goalData.notifications_enabled || false,
        reward_enabled: goalData.reward_enabled || false,
        reward_description: goalData.reward_description || null,
        notes: goalData.notes || null,
        assigned_tasks: goalData.assigned_tasks || [],
        assigned_projects: goalData.assigned_projects || [],
        project_id: goalData.project_id || null,
        created_by: user.id,
      };

      console.log('Goal payload:', goalPayload);

      const { data, error } = await supabase
        .from(goalData.project_id ? 'project_goals' : 'goals')
        .insert(goalPayload)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      if (data.project_id) {
        queryClient.invalidateQueries({ queryKey: ['projectGoals', data.project_id] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['goals'] });
      }
      showSuccessToast('Meta criada com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating goal:', error);
      showErrorToast('Erro ao criar meta: ' + error.message);
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Goal> }) => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('Updating goal:', id, updates);
      
      const { data, error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id)
        .eq('created_by', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating goal:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: (data, variables) => {
      if (data.project_id) {
        queryClient.invalidateQueries({ queryKey: ["projectGoals", data.project_id] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["goals"] });
      }
      
      // Optimistic update
      queryClient.setQueryData([variables.updates.project_id ? "projectGoals" : "goals", user?.id, variables.updates.project_id], (old: Goal[] | undefined) => {
        if (!old) return old;
        return old.map(goal => 
          goal.id === variables.id ? { ...goal, ...variables.updates } : goal
        );
      });
      
      showSuccessToast("Meta atualizada com sucesso!");
    },
    onError: (error) => {
      console.error('Error updating goal:', error);
      showErrorToast('Erro ao atualizar meta');
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)
        .eq('created_by', user.id);

      if (error) throw error;
    },
    onSuccess: (data, id) => {
      // Invalidate both general goals and project goals queries
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["projectGoals"] });
      showSuccessToast("Meta excluída com sucesso!");
    },
    onError: (error) => {
      console.error('Error deleting goal:', error);
      showErrorToast('Erro ao excluir meta');
    },
  });

  return {
    goals: goalsQuery.data || [],
    isLoading: goalsQuery.isLoading,
    error: goalsQuery.error,
    createGoal: createGoalMutation.mutate,
    updateGoal: updateGoalMutation.mutate,
    deleteGoal: deleteGoalMutation.mutate,
    isCreating: createGoalMutation.isPending,
    isUpdating: updateGoalMutation.isPending,
    isDeleting: deleteGoalMutation.isPending,
  };
}
