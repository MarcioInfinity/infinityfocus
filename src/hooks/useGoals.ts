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
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (projectId) {
        // Filtrar goals que tenham o projectId em assigned_projects
        const { data, error } = await query;
        if (error) throw error;
      return (data || []).filter(goal => 
        goal.assigned_projects && goal.assigned_projects.includes(projectId)
      ).map(goal => ({
        ...goal,
        checklist: [],
        assigned_projects: goal.assigned_projects || [],
        assigned_tasks: goal.assigned_tasks || [],
        user_id: goal.created_by, // Mapear para compatibilidade
      })) as Goal[];
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Erro ao buscar metas:', error);
        throw error;
      }
      
      return (data || []).map(goal => ({
        ...goal,
        checklist: [],
        assigned_projects: goal.assigned_projects || [],
        assigned_tasks: goal.assigned_tasks || [],
        user_id: goal.created_by, // Mapear para compatibilidade
      })) as Goal[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
  });

  const createGoal = useMutation({
    mutationFn: async (goalData: Partial<Goal>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const goalToCreate = {
        name: goalData.name || '',
        created_by: user.id,
        priority: goalData.priority || 'medium',
        category: goalData.category || 'professional',
        progress: goalData.progress || 0,
        is_shared: goalData.is_shared || false,
        notifications_enabled: goalData.notifications_enabled || false,
        reward_enabled: goalData.reward_enabled || false,
        assigned_projects: goalData.assigned_projects || [],
        assigned_tasks: goalData.assigned_tasks || [],
        description: goalData.description || null,
        start_date: goalData.start_date || null,
        due_date: goalData.due_date || null,
        reward_description: goalData.reward_description || null,
        notes: goalData.notes || null,
        ...goalData,
      };

      // Se projectId for fornecido, adicionar à lista de projetos atribuídos
      if (projectId && goalToCreate.assigned_projects) {
        if (!goalToCreate.assigned_projects.includes(projectId)) {
          goalToCreate.assigned_projects.push(projectId);
        }
      }

      const { data, error } = await supabase
        .from('goals')
        .insert(goalToCreate)
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar meta:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
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
          progress: completed ? 100 : 0,
          updated_at: new Date().toISOString()
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
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success(updatedGoal.progress === 100 ? 'Meta concluída!' : 'Meta reaberta!');
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