import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Goal } from '@/types';
import { toast } from 'sonner';

export function useGoals(projectId?: string) {
  const queryClient = useQueryClient();

  const { data: goals = [], isLoading, error } = useQuery({
    queryKey: ['goals', projectId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      let query = supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Erro ao buscar metas:', error);
        throw error;
      }
      
      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
  });

  const createGoal = useMutation({
    mutationFn: async (goalData: Partial<Goal>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('goals')
        .insert([{ ...goalData, user_id: user.id }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar meta:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (newGoal) => {
      // Invalidar queries relacionadas de forma mais específica
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      if (newGoal.project_id) {
        queryClient.invalidateQueries({ queryKey: ['goals', newGoal.project_id] });
      }
      toast.success('Meta criada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar meta:', error);
      toast.error('Erro ao criar meta. Tente novamente.');
    },
  });

  const updateGoal = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Goal> }) => {
      const { data, error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar meta:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (updatedGoal) => {
      // Invalidar queries relacionadas de forma mais específica
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      if (updatedGoal.project_id) {
        queryClient.invalidateQueries({ queryKey: ['goals', updatedGoal.project_id] });
      }
      toast.success('Meta atualizada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar meta:', error);
      toast.error('Erro ao atualizar meta. Tente novamente.');
    },
  });

  const deleteGoal = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir meta:', error);
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      // Invalidar todas as queries de metas
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Meta excluída com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao excluir meta:', error);
      toast.error('Erro ao excluir meta. Tente novamente.');
    },
  });

  const toggleGoalComplete = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { data, error } = await supabase
        .from('goals')
        .update({ 
          completed,
          completed_at: completed ? new Date().toISOString() : null 
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao alterar status da meta:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (updatedGoal) => {
      // Invalidar queries relacionadas de forma mais específica
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      if (updatedGoal.project_id) {
        queryClient.invalidateQueries({ queryKey: ['goals', updatedGoal.project_id] });
      }
      toast.success(updatedGoal.completed ? 'Meta concluída!' : 'Meta reaberta!');
    },
    onError: (error) => {
      console.error('Erro ao alterar status da meta:', error);
      toast.error('Erro ao alterar status da meta. Tente novamente.');
    },
  });

  return {
    goals,
    isLoading,
    error,
    createGoal: createGoal.mutate,
    updateGoal: updateGoal.mutate,
    deleteGoal: deleteGoal.mutate,
    toggleGoalComplete: toggleGoalComplete.mutate,
    isCreating: createGoal.isPending,
    isUpdating: updateGoal.isPending,
    isDeleting: deleteGoal.isPending,
    isToggling: toggleGoalComplete.isPending,
  };
}
