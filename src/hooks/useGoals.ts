
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Goal } from '@/types';
import { useAuth } from './useAuth';
import { useToastNotifications } from './use-toast-notifications';

export function useGoals() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useToastNotifications();

  const goalsQuery = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching goals:', error);
        throw error;
      }

      return data as Goal[];
    },
    enabled: !!user,
  });

  const createGoalMutation = useMutation({
    mutationFn: async (goalData: Partial<Goal>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('goals')
        .insert({
          name: goalData.name!,
          description: goalData.description,
          priority: goalData.priority || 'medium',
          category: goalData.category || 'professional',
          progress: goalData.progress || 0,
          start_date: goalData.start_date,
          due_date: goalData.due_date,
          is_shared: goalData.is_shared || false,
          notifications_enabled: goalData.notifications_enabled || false,
          reward_enabled: goalData.reward_enabled || false,
          reward_description: goalData.reward_description,
          assigned_projects: goalData.assigned_projects || [],
          assigned_tasks: goalData.assigned_tasks || [],
          notes: goalData.notes,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      showSuccessToast('Meta criada com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating goal:', error);
      showErrorToast('Erro ao criar meta');
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Goal> }) => {
      const { data, error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      showSuccessToast('Meta atualizada com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating goal:', error);
      showErrorToast('Erro ao atualizar meta');
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      showSuccessToast('Meta excluída com sucesso!');
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
