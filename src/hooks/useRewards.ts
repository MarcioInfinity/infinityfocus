import { useState } from 'react';
import { useToastNotifications } from './use-toast-notifications';

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
  const { showSuccessToast, showErrorToast } = useToastNotifications();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const createReward = async (rewardData: CreateRewardPayload) => {
    try {
      setIsLoading(true);
      const newReward: Reward = {
        id: Math.random().toString(36).substr(2, 9),
        ...rewardData,
        investment_value: rewardData.investment_value || 0,
        currency: rewardData.currency || 'BRL',
        user_id: 'current-user-id',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      setRewards(prev => [newReward, ...prev]);
      showSuccessToast('Recompensa criada com sucesso!');
    } catch (error) {
      showErrorToast('Erro ao criar recompensa');
    } finally {
      setIsLoading(false);
    }
  };

  const updateReward = async ({ id, updates }: { id: string; updates: Partial<Reward> }) => {
    try {
      setIsLoading(true);
      setRewards(prev => prev.map(reward => 
        reward.id === id 
          ? { ...reward, ...updates, updated_at: new Date().toISOString() }
          : reward
      ));
      showSuccessToast('Recompensa atualizada com sucesso!');
    } catch (error) {
      showErrorToast('Erro ao atualizar recompensa');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteReward = async (id: string) => {
    try {
      setIsLoading(true);
      setRewards(prev => prev.filter(reward => reward.id !== id));
      showSuccessToast('Recompensa excluída com sucesso!');
    } catch (error) {
      showErrorToast('Erro ao excluir recompensa');
    } finally {
      setIsLoading(false);
    }
  };

  const getRewardsByType = (type: 'task' | 'project' | 'goal') => {
    return rewards.filter(reward => reward.attributed_to_type === type);
  };

  const getRewardsByItem = (type: 'task' | 'project' | 'goal', itemId: string) => {
    return rewards.filter(
      reward => reward.attributed_to_type === type && reward.attributed_to_id === itemId
    );
  };

  return {
    rewards,
    isLoading,
    error: null,
    createReward,
    updateReward,
    deleteReward,
    isCreating: isLoading,
    isUpdating: isLoading,
    isDeleting: isLoading,
    getRewardsByType,
    getRewardsByItem,
  };
}