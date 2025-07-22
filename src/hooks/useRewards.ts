
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToastNotifications } from './use-toast-notifications';

export interface Reward {
  id: string;
  title: string;
  description?: string;
  celebration_level: 'small' | 'medium' | 'large';
  investment_value?: number;
  currency?: string;
  attributed_to_type: 'task' | 'project' | 'goal';
  attributed_to_id: string;
  attributed_item_name?: string;
  is_claimed: boolean;
  claimed_at?: string;
  user_id: string;
  created_at: string;
  updated_at?: string;
}

export function useRewards() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useToastNotifications();

  const rewardsQuery = useQuery({
    queryKey: ['rewards', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching rewards:', error);
        throw error;
      }

      return (data || []) as Reward[];
    },
    enabled: !!user,
  });

  const createRewardMutation = useMutation({
    mutationFn: async (rewardData: any) => {
      if (!user) throw new Error('User not authenticated');

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

  const claimRewardMutation = useMutation({
    mutationFn: async (rewardId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('rewards')
        .update({
          is_claimed: true,
          claimed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', rewardId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      showSuccessToast('Recompensa resgatada!');
    },
    onError: (error) => {
      console.error('Error claiming reward:', error);
      showErrorToast('Erro ao resgatar recompensa');
    },
  });

  return {
    rewards: rewardsQuery.data || [],
    isLoading: rewardsQuery.isLoading,
    error: rewardsQuery.error,
    createReward: createRewardMutation.mutate,
    claimReward: claimRewardMutation.mutate,
    isCreating: createRewardMutation.isPending,
    isClaiming: claimRewardMutation.isPending,
  };
}
