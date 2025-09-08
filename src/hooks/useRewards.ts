import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Reward {
  id: string;
  title: string;
  description?: string;
  celebration_level: 'small' | 'medium' | 'large' | 'epic';
  investment_value: number;
  currency: string;
  attributed_to_type: 'task' | 'project' | 'goal';
  attributed_to_id: string;
  attributed_item_name: string;
  user_id: string;
  is_claimed?: boolean;
  claimed_at?: string;
  created_at: string;
  updated_at: string;
}

interface CreateRewardPayload {
  title: string;
  description?: string;
  celebration_level: 'small' | 'medium' | 'large' | 'epic';
  investment_value?: number;
  currency?: string;
  attributed_to_type: 'task' | 'project' | 'goal';
  attributed_to_id: string;
  attributed_item_name: string;
}

export function useRewards() {
  const queryClient = useQueryClient();

  const { data: rewards = [], isLoading, error } = useQuery({
    queryKey: ['rewards'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar recompensas:', error);
        throw error;
      }
      
      return (data || []).map(reward => ({
        ...reward,
        investment_value: reward.investment_value || 0,
        currency: reward.currency || 'BRL',
        is_claimed: reward.is_claimed || false,
      })) as Reward[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
  });

  // Query separada para buscar dados dos itens atribuídos (tasks, projects, goals)
  const { data: availableItems = { tasks: [], projects: [], goals: [] } } = useQuery({
    queryKey: ['available-items-for-rewards'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const [tasksResult, projectsResult, goalsResult] = await Promise.all([
        supabase.from('tasks').select('id, title').eq('user_id', user.id),
        supabase.from('projects').select('id, name').eq('owner_id', user.id),
        supabase.from('goals').select('id, name').eq('created_by', user.id),
      ]);

      return {
        tasks: (tasksResult.data || []).map(t => ({ id: t.id, name: t.title })),
        projects: (projectsResult.data || []).map(p => ({ id: p.id, name: p.name })),
        goals: (goalsResult.data || []).map(g => ({ id: g.id, name: g.name })),
      };
    },
    staleTime: 1000 * 60 * 5,
  });

  const createReward = useMutation({
    mutationFn: async (rewardData: CreateRewardPayload) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const rewardToCreate = {
        ...rewardData,
        user_id: user.id,
        investment_value: rewardData.investment_value || 0,
        currency: rewardData.currency || 'BRL',
        is_claimed: false,
      };

      const { data, error } = await supabase
        .from('rewards')
        .insert(rewardToCreate)
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar recompensa:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      toast.success('Recompensa criada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar recompensa:', error);
      toast.error('Erro ao criar recompensa. Tente novamente.');
    },
  });

  const updateReward = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Reward> }) => {
      const { data, error } = await supabase
        .from('rewards')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar recompensa:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      toast.success('Recompensa atualizada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar recompensa:', error);
      toast.error('Erro ao atualizar recompensa. Tente novamente.');
    },
  });

  const deleteReward = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('rewards')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir recompensa:', error);
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      toast.success('Recompensa excluída com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao excluir recompensa:', error);
      toast.error('Erro ao excluir recompensa. Tente novamente.');
    },
  });

  const claimReward = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('rewards')
        .update({ 
          is_claimed: true,
          claimed_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao reivindicar recompensa:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      toast.success('Recompensa reivindicada com sucesso! 🎉');
    },
    onError: (error) => {
      console.error('Erro ao reivindicar recompensa:', error);
      toast.error('Erro ao reivindicar recompensa. Tente novamente.');
    },
  });

  const getRewardsByType = (type: 'task' | 'project' | 'goal') => {
    return rewards.filter(reward => reward.attributed_to_type === type);
  };

  const getRewardsByItem = (type: 'task' | 'project' | 'goal', itemId: string) => {
    return rewards.filter(
      reward => reward.attributed_to_type === type && reward.attributed_to_id === itemId
    );
  };

  // Estatísticas das recompensas
  const getRewardStats = () => {
    const totalRewards = rewards.length;
    const claimedRewards = rewards.filter(r => r.is_claimed).length;
    const pendingRewards = totalRewards - claimedRewards;
    const totalValue = rewards.reduce((sum, r) => sum + (r.investment_value || 0), 0);
    const claimedValue = rewards.filter(r => r.is_claimed).reduce((sum, r) => sum + (r.investment_value || 0), 0);
    const pendingValue = totalValue - claimedValue;

    return {
      totalRewards,
      claimedRewards,
      pendingRewards,
      totalValue,
      claimedValue,
      pendingValue,
    };
  };

  return {
    rewards,
    availableItems,
    isLoading,
    error,
    createReward: createReward.mutate,
    updateReward: updateReward.mutate,
    deleteReward: deleteReward.mutate,
    claimReward: claimReward.mutate,
    isCreating: createReward.isPending,
    isUpdating: updateReward.isPending,
    isDeleting: deleteReward.isPending,
    isClaiming: claimReward.isPending,
    getRewardsByType,
    getRewardsByItem,
    getRewardStats,
  };
}