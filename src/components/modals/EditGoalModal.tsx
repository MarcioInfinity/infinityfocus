import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GoalForm } from '@/components/forms/GoalForm';
import { useGoals } from '@/hooks/useGoals';
import { useToastNotifications } from '@/hooks/use-toast-notifications';
import { Goal } from '@/types';

interface EditGoalModalProps {
  goalId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditGoalModal({ goalId, isOpen, onClose }: EditGoalModalProps) {
  const { goals, updateGoal } = useGoals();
  const { showSuccessToast, showErrorToast } = useToastNotifications();
  const [goalData, setGoalData] = useState<Goal | null>(null);

  useEffect(() => {
    if (goalId && isOpen) {
      const goal = goals.find(g => g.id === goalId);
      if (goal) {
        setGoalData(goal);
      }
    }
  }, [goalId, goals, isOpen]);

  const handleSubmit = async (data: Goal) => {
    if (!goalId) return;

    try {
      await updateGoal({
        id: goalId,
        updates: data
      });
      showSuccessToast('Meta atualizada com sucesso!');
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar meta:', error);
      showErrorToast('Erro ao atualizar meta. Tente novamente.');
    }
  };

  const handleCancel = () => {
    setGoalData(null);
    onClose();
  };

  if (!goalData) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Meta</DialogTitle>
        </DialogHeader>
        <GoalForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          initialData={goalData}
        />
      </DialogContent>
    </Dialog>
  );
}

