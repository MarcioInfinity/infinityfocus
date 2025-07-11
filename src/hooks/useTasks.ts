
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types';
import { useAuth } from './useAuth';
import { useToastNotifications } from './use-toast-notifications';

export function useTasks(projectId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useToastNotifications();

  const tasksQuery = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('tasks')
        .select(`
          *,
          checklist_items (
            id,
            text,
            completed,
            created_at
          ),
          custom_notifications (
            id,
            type,
            time,
            days_of_week,
            specific_date,
            message,
            is_active,
            created_at,
            updated_at
          )
        `)
        .order('created_at', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching tasks:', error);
        throw error;
      }

      return data.map(task => ({
        ...task,
        checklist: task.checklist_items || [],
        notifications: task.custom_notifications || [],
      })) as Task[];
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
