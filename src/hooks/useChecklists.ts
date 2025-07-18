
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToastNotifications } from './use-toast-notifications';
import { ChecklistItem } from '@/types';

export function useChecklists(parentId: string, parentType: 'task' | 'project' | 'goal') {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useToastNotifications();

  const checklistQuery = useQuery({
    queryKey: ['checklists', parentId, parentType],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('checklists')
        .select('*')
        .eq('parent_id', parentId)
        .eq('parent_type', parentType)
        .order('position', { ascending: true });

      if (error) throw error;
      return (data || []) as ChecklistItem[];
    },
    enabled: !!user && !!parentId,
  });

  const createChecklistItemMutation = useMutation({
    mutationFn: async (data: { title: string; position?: number }) => {
      if (!user) throw new Error('User not authenticated');

      const { data: result, error } = await supabase
        .from('checklists')
        .insert({
          parent_id: parentId,
          parent_type: parentType,
          title: data.title,
          position: data.position || 0,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists', parentId, parentType] });
      showSuccessToast('Item adicionado ao checklist!');
    },
    onError: (error) => {
      showErrorToast('Erro ao adicionar item: ' + error.message);
    },
  });

  const updateChecklistItemMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ChecklistItem> }) => {
      const { data, error } = await supabase
        .from('checklists')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists', parentId, parentType] });
    },
    onError: (error) => {
      showErrorToast('Erro ao atualizar item');
    },
  });

  const deleteChecklistItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('checklists')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists', parentId, parentType] });
      showSuccessToast('Item removido do checklist!');
    },
    onError: (error) => {
      showErrorToast('Erro ao remover item');
    },
  });

  return {
    checklist: checklistQuery.data || [],
    isLoading: checklistQuery.isLoading,
    createItem: createChecklistItemMutation.mutate,
    updateItem: updateChecklistItemMutation.mutate,
    deleteItem: deleteChecklistItemMutation.mutate,
    isCreating: createChecklistItemMutation.isPending,
    isUpdating: updateChecklistItemMutation.isPending,
    isDeleting: deleteChecklistItemMutation.isPending,
  };
}
