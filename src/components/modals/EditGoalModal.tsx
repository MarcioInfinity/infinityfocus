
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GoalForm } from '@/components/forms/GoalForm';
import { Goal } from '@/types';

interface EditGoalModalProps {
  goal: Goal | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (goalData: any) => void;
}

export function EditGoalModal({ goal, isOpen, onClose, onSave }: EditGoalModalProps) {
  if (!goal) return null;

  const handleSubmit = (formData: any) => {
    onSave({
      id: goal.id,
      ...formData,
    });
    onClose();
  };

  const initialData = {
    name: goal.name,
    description: goal.description || '',
    priority: goal.priority,
    category: goal.category,
    progress: goal.progress,
    start_date: goal.start_date ? new Date(goal.start_date) : undefined,
    due_date: goal.due_date ? new Date(goal.due_date) : undefined,
    is_shared: goal.is_shared,
    notifications_enabled: goal.notifications_enabled,
    reward_enabled: goal.reward_enabled,
    reward_description: goal.reward_description || '',
    assigned_projects: goal.assigned_projects || [],
    assigned_tasks: goal.assigned_tasks || [],
    notes: goal.notes || '',
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Meta</DialogTitle>
        </DialogHeader>
        <GoalForm
          onSubmit={handleSubmit}
          onCancel={onClose}
          initialData={initialData}
        />
      </DialogContent>
    </Dialog>
  );
}
