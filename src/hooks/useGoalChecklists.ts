import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface GoalChecklistItem {
  id: string;
  parent_id: string;
  parent_type: string;
  title: string;
  completed: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export function useGoalChecklists(goalId: string) {
  const queryClient = useQueryClient();

  const { data: checklistItems = [], isLoading, error } = useQuery({
    queryKey: ['goal-checklists', goalId],
    queryFn: async () => {
      if (!goalId) return [];

      const { data, error } = await supabase
        .from('checklists')
        .select('*')
        .eq('parent_id', goalId)
        .eq('parent_type', 'goal')
        .order('position', { ascending: true });

      if (error) {
        console.error('Erro ao buscar checklist da meta:', error);
        throw error;
      }

      return (data || []) as GoalChecklistItem[];
    },
    enabled: !!goalId,
    staleTime: 1000 * 60 * 5,
  });

  const createChecklistItem = useMutation({
    mutationFn: async ({ title, position }: { title: string; position: number }) => {
      const { data, error } = await supabase
        .from('checklists')
        .insert({
          parent_id: goalId,
          parent_type: 'goal',
          title,
          position,
          completed: false,
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar item de checklist:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goal-checklists', goalId] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Item adicionado ao checklist!');
    },
    onError: (error) => {
      console.error('Erro ao criar item:', error);
      toast.error('Erro ao adicionar item. Tente novamente.');
    },
  });

  const updateChecklistItem = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<GoalChecklistItem> }) => {
      const { data, error } = await supabase
        .from('checklists')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar item:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goal-checklists', goalId] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
    onError: (error) => {
      console.error('Erro ao atualizar item:', error);
      toast.error('Erro ao atualizar item. Tente novamente.');
    },
  });

  const toggleChecklistItem = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { data, error } = await supabase
        .from('checklists')
        .update({ completed })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao marcar item:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goal-checklists', goalId] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
    onError: (error) => {
      console.error('Erro ao marcar item:', error);
      toast.error('Erro ao marcar item. Tente novamente.');
    },
  });

  const deleteChecklistItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('checklists')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir item:', error);
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goal-checklists', goalId] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast.success('Item excluído!');
    },
    onError: (error) => {
      console.error('Erro ao excluir item:', error);
      toast.error('Erro ao excluir item. Tente novamente.');
    },
  });

  return {
    checklistItems,
    isLoading,
    error,
    createChecklistItem: createChecklistItem.mutate,
    updateChecklistItem: updateChecklistItem.mutate,
    toggleChecklistItem: toggleChecklistItem.mutate,
    deleteChecklistItem: deleteChecklistItem.mutate,
    isCreating: createChecklistItem.isPending,
    isUpdating: updateChecklistItem.isPending,
    isToggling: toggleChecklistItem.isPending,
    isDeleting: deleteChecklistItem.isPending,
  };
}
