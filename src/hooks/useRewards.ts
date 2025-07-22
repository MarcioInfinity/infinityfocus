
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToastNotifications } from './use-toast-notifications';

export function useRewards() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useToastNotifications();

  const rewardsQuery = useQuery({
    queryKey: ['rewards', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      console.log('Fetching rewards for user:', user.id);
      
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching rewards:', error);
        throw error;
      }

      console.log('Rewards fetched:', data?.length || 0);
      return data || [];
    },
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  });

  const createRewardMutation = useMutation({
    mutationFn: async (rewardData: any) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Creating reward with data:', rewardData);

      const rewardPayload = {
        title: rewardData.title,
        description: rewardData.description || null,
        celebration_level: rewardData.celebration_level,
        investment_value: rewardData.investment_value || null,
        currency: rewardData.currency || 'BRL',
        attributed_to_type: rewardData.attributed_to_type,
        attributed_to_id: rewardData.attributed_to_id,
        attributed_item_name: rewardData.attributed_item_name || null,
        user_id: user.id,
        is_claimed: false,
      };

      console.log('Reward payload:', rewardPayload);

      const { data, error } = await supabase
        .from('rewards')
        .insert(rewardPayload)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      showSuccessToast('Recompensa criada com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating reward:', error);
      showErrorToast('Erro ao criar recompensa: ' + error.message);
    },
  });

  const updateRewardMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('Updating reward:', id, updates);
      
      const { data, error } = await supabase
        .from('rewards')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating reward:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      showSuccessToast('Recompensa atualizada com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating reward:', error);
      showErrorToast('Erro ao atualizar recompensa');
    },
  });

  const deleteRewardMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('rewards')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      showSuccessToast('Recompensa excluída com sucesso!');
    },
    onError: (error) => {
      console.error('Error deleting reward:', error);
      showErrorToast('Erro ao excluir recompensa');
    },
  });

  return {
    rewards: rewardsQuery.data || [],
    isLoading: rewardsQuery.isLoading,
    error: rewardsQuery.error,
    createReward: createRewardMutation.mutate,
    updateReward: updateRewardMutation.mutate,
    deleteReward: deleteRewardMutation.mutate,
    isCreating: createRewardMutation.isPending,
    isUpdating: updateRewardMutation.isPending,
    isDeleting: deleteRewardMutation.isPending,
  };
}
