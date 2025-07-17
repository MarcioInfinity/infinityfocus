
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToastNotifications } from './use-toast-notifications';
import { Goal, CategoryType } from '@/types';
import { toISOStringWithoutTimeZone, convertCategoryToEnglish } from '@/lib/utils';

export function useGoals() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useToastNotifications();

  const goalsQuery = useQuery({
    queryKey: ['goals', user?.id],
    queryFn: async () => {
      if (!user) {
        console.log('User not authenticated, returning empty goals array.');
        return [];
      }
      
      console.log('Attempting to fetch goals for user:', user.id);
      
      // Corrigido: usar created_by que é o campo correto na tabela goals
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching goals from Supabase:', error);
        throw error;
      }

      console.log('Goals fetched successfully:', data?.length || 0, 'goals.');

      // Return goals with proper typing
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

      // Convert category to English and ensure it's a valid CategoryType
      const convertedCategory = convertCategoryToEnglish(goalData.category);
      const validCategory: CategoryType = convertedCategory || 'professional';

      const goalPayload = {
        name: goalData.name,
        description: goalData.description || null,
        priority: goalData.priority || 'medium',
        category: validCategory,
        start_date: goalData.start_date ? toISOStringWithoutTimeZone(new Date(goalData.start_date)) : null,
        due_date: goalData.due_date ? toISOStringWithoutTimeZone(new Date(goalData.due_date)) : null,
        progress: goalData.progress || 0,
        is_shared: goalData.is_shared || false,
        notifications_enabled: goalData.notifications_enabled || false,
        reward_enabled: goalData.reward_enabled || false,
        reward_description: goalData.reward_description || null,
        notes: goalData.notes || null,
        assigned_tasks: goalData.assigned_tasks || [],
        assigned_projects: goalData.assigned_projects || [],
        created_by: user.id, // Corrigido: usar apenas created_by
      };

      console.log('Goal payload:', goalPayload);

      const { data, error } = await supabase
        .from('goals')
        .insert(goalPayload)
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
      queryClient.invalidateQueries({ queryKey: ['goals', user?.id] });
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

      // Convert category to English and ensure it's a valid CategoryType
      const convertedCategory = updates.category ? convertCategoryToEnglish(updates.category) : updates.category;
      const validCategory: CategoryType | undefined = convertedCategory as CategoryType;

      const updatedPayload: any = {
        ...updates,
        category: validCategory,
        start_date: updates.start_date ? toISOStringWithoutTimeZone(new Date(updates.start_date)) : updates.start_date,
        due_date: updates.due_date ? toISOStringWithoutTimeZone(new Date(updates.due_date)) : updates.due_date,
      };
      
      const { data, error } = await supabase
        .from('goals')
        .update(updatedPayload)
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
      // Corrigido: invalidar com a queryKey específica do usuário
      queryClient.invalidateQueries({ queryKey: ['goals', user?.id] });
      
      // Optimistic update
      queryClient.setQueryData(['goals', user?.id], (old: Goal[] | undefined) => {
        if (!old) return old;
        return old.map(goal => 
          goal.id === variables.id ? { ...goal, ...variables.updates } : goal
        );
      });
      
      showSuccessToast('Meta atualizada com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating goal:', error);
      showErrorToast('Erro ao atualizar meta: ' + error.message);
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
    onSuccess: () => {
      // Corrigido: invalidar com a queryKey específica do usuário
      queryClient.invalidateQueries({ queryKey: ['goals', user?.id] });
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
