
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToastNotifications } from './use-toast-notifications';
import { Task } from '@/types';

export function useTasks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useToastNotifications();

  const tasksQuery = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tasks:', error);
        throw error;
      }

      return data as Task[];
    },
    enabled: !!user,
  });

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: Partial<Task>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: taskData.title!,
          description: taskData.description,
          priority: taskData.priority || 'medium',
          category: taskData.category || 'professional',
          status: taskData.status || 'todo',
          due_date: taskData.due_date,
          start_date: taskData.start_date,
          start_time: taskData.start_time,
          end_time: taskData.end_time,
          is_indefinite: taskData.is_indefinite || false,
          assigned_to: taskData.assigned_to,
          project_id: taskData.project_id,
          goal_id: taskData.goal_id,
          tags: taskData.tags || [],
          notifications_enabled: taskData.notifications_enabled || false,
          repeat_enabled: taskData.repeat_enabled || false,
          repeat_type: taskData.repeat_type,
          repeat_days: taskData.repeat_days,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      showSuccessToast('Tarefa criada com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating task:', error);
      showErrorToast('Erro ao criar tarefa');
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Task> }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      showSuccessToast('Tarefa atualizada com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating task:', error);
      showErrorToast('Erro ao atualizar tarefa');
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      showSuccessToast('Tarefa excluída com sucesso!');
    },
    onError: (error) => {
      console.error('Error deleting task:', error);
      showErrorToast('Erro ao excluir tarefa');
    },
  });

  return {
    tasks: tasksQuery.data || [],
    isLoading: tasksQuery.isLoading,
    error: tasksQuery.error,
    createTask: createTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
  };
}
