
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToastNotifications } from './use-toast-notifications';
import { Observation } from '@/types';

export function useObservations(parentId: string, parentType: 'task' | 'project' | 'goal') {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useToastNotifications();

  const observationsQuery = useQuery({
    queryKey: ['observations', parentId, parentType],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('observations')
        .select('*')
        .eq('parent_id', parentId)
        .eq('parent_type', parentType)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Observation[];
    },
    enabled: !!user && !!parentId,
  });

  const createObservationMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('observations')
        .insert({
          parent_id: parentId,
          parent_type: parentType,
          content,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['observations', parentId, parentType] });
      showSuccessToast('Observação adicionada!');
    },
    onError: (error) => {
      showErrorToast('Erro ao adicionar observação: ' + error.message);
    },
  });

  const deleteObservationMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('observations')
        .delete()
        .eq('id', id)
        .eq('created_by', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['observations', parentId, parentType] });
      showSuccessToast('Observação removida!');
    },
    onError: (error) => {
      showErrorToast('Erro ao remover observação');
    },
  });

  return {
    observations: observationsQuery.data || [],
    isLoading: observationsQuery.isLoading,
    createObservation: createObservationMutation.mutate,
    deleteObservation: deleteObservationMutation.mutate,
    isCreating: createObservationMutation.isPending,
    isDeleting: deleteObservationMutation.isPending,
  };
}
