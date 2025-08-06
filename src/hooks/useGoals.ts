import { useState } from 'react';
import { Goal } from '@/types';
import { toast } from 'sonner';

export function useGoals(projectId?: string) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const createGoal = async (goalData: Partial<Goal>) => {
    try {
      setIsLoading(true);
      const newGoal: Goal = {
        id: Math.random().toString(36).substr(2, 9),
        name: goalData.name || '',
        created_by: 'current-user-id',
        user_id: 'current-user-id',
        assigned_projects: goalData.assigned_projects || [],
        assigned_tasks: goalData.assigned_tasks || [],
        priority: goalData.priority || 'medium',
        category: goalData.category || 'professional',
        progress: goalData.progress || 0,
        is_shared: goalData.is_shared || false,
        notifications_enabled: goalData.notifications_enabled || false,
        reward_enabled: goalData.reward_enabled || false,
        checklist: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...goalData,
      };
      
      if (projectId) {
        newGoal.project_id = projectId;
      }
      
      setGoals(prev => [newGoal, ...prev]);
      toast.success('Meta criada com sucesso!');
    } catch (error) {
      toast.error('Erro ao criar meta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateGoal = async ({ id, updates }: { id: string; updates: Partial<Goal> }) => {
    try {
      setIsLoading(true);
      setGoals(prev => prev.map(goal => 
        goal.id === id 
          ? { ...goal, ...updates, updated_at: new Date().toISOString() }
          : goal
      ));
      toast.success('Meta atualizada com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar meta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      setIsLoading(true);
      setGoals(prev => prev.filter(goal => goal.id !== id));
      toast.success('Meta excluída com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir meta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleGoalComplete = async ({ id, completed }: { id: string; completed: boolean }) => {
    try {
      setIsLoading(true);
      setGoals(prev => prev.map(goal => 
        goal.id === id 
          ? { 
              ...goal, 
              progress: completed ? 100 : 0,
              updated_at: new Date().toISOString()
            }
          : goal
      ));
      toast.success(completed ? 'Meta concluída!' : 'Meta reaberta!');
    } catch (error) {
      toast.error('Erro ao alterar status da meta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    goals: projectId ? goals.filter(goal => goal.project_id === projectId) : goals,
    isLoading,
    error: null,
    createGoal,
    updateGoal,
    deleteGoal,
    toggleGoalComplete,
    isCreating: isLoading,
    isUpdating: isLoading,
    isDeleting: isLoading,
    isToggling: isLoading,
  };
}