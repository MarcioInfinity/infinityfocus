import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TaskFormImproved } from '@/components/forms/TaskFormImproved';
import { useTasksImproved } from '@/hooks/useTasksImproved';
import { useProjects } from '@/hooks/useProjects';
import { useGoals } from '@/hooks/useGoals';
import { useToastNotifications } from '@/hooks/use-toast-notifications';

interface EditTaskModalProps {
  taskId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditTaskModal({ taskId, isOpen, onClose }: EditTaskModalProps) {
  const { tasks, updateTask } = useTasks();
  const { projects } = useProjects();
  const { goals } = useGoals();
  const { showSuccessToast, showErrorToast } = useToastNotifications();
  const [taskData, setTaskData] = useState<any>(null);

  useEffect(() => {
    if (taskId && isOpen) {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        setTaskData(task);
      }
    }
  }, [taskId, tasks, isOpen]);

  const handleSubmit = async (data: any) => {
    if (!taskId) return;

    try {
      await updateTask({
        id: taskId,
        updates: data
      });
      showSuccessToast('Tarefa atualizada com sucesso!');
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      showErrorToast('Erro ao atualizar tarefa. Tente novamente.');
    }
  };

  const handleCancel = () => {
    setTaskData(null);
    onClose();
  };

  if (!taskData) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Tarefa</DialogTitle>
        </DialogHeader>
        <TaskFormImproved
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          initialData={taskData}
          projects={projects}
          goals={goals}
        />
      </DialogContent>
    </Dialog>
  );
}

