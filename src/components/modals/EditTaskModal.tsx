
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TaskForm } from '@/components/forms/TaskForm';
import { Task } from '@/types';

interface EditTaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: any) => void;
}

export function EditTaskModal({ task, isOpen, onClose, onSave }: EditTaskModalProps) {
  if (!task) return null;

  const handleSubmit = (formData: any) => {
    onSave({
      id: task.id,
      ...formData,
    });
    onClose();
  };

  const initialData = {
    title: task.title,
    description: task.description || '',
    priority: task.priority,
    category: task.category,
    due_date: task.due_date ? new Date(task.due_date) : undefined,
    start_date: task.start_date ? new Date(task.start_date) : undefined,
    start_time: task.start_time || '',
    end_time: task.end_time || '',
    is_indefinite: task.is_indefinite || false,
    tags: task.tags || [],
    notifications_enabled: task.notifications_enabled,
    repeat_enabled: task.repeat_enabled,
    repeat_type: task.repeat_type,
    repeat_days: task.repeat_days || [],
    monthly_day: task.monthly_day,
    project_id: task.project_id || '',
    goal_id: task.goal_id || '',
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Tarefa</DialogTitle>
        </DialogHeader>
        <TaskForm
          onSubmit={handleSubmit}
          onCancel={onClose}
          initialData={initialData}
        />
      </DialogContent>
    </Dialog>
  );
}
