
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
      
      console.log('Fetching tasks for user:', user.id);
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tasks:', error);
        throw error;
      }

      console.log('Tasks fetched:', data?.length || 0);
      
      // Transform data to match interface with default values
      return (data || []).map(task => ({
        ...task,
        checklist: [],
        notifications: [],
        tags: task.tags || [],
        monthly_day: task.monthly_day || undefined,
        custom_dates: task.custom_dates || []
      })) as Task[];
    },
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  });

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Creating task with data:', taskData);

      const taskPayload = {
        title: taskData.title,
        description: taskData.description || null,
        priority: taskData.priority || 'medium',
        category: taskData.category || 'professional',
        status: 'todo' as const,
        due_date: taskData.due_date || null,
        start_date: taskData.start_date || null,
        start_time: taskData.start_time || null,
        end_time: taskData.end_time || null,
        is_indefinite: taskData.is_indefinite || false,
        assigned_to: taskData.assigned_to || null,
        project_id: taskData.project_id || null,
        goal_id: taskData.goal_id || null,
        tags: taskData.tags || [],
        notifications_enabled: taskData.notifications_enabled || false,
        repeat_enabled: taskData.repeat_enabled || false,
        repeat_type: taskData.repeat_type || null,
        repeat_days: taskData.repeat_days ? taskData.repeat_days.map(String) : null,
        monthly_day: taskData.monthly_day || null,
        custom_dates: taskData.custom_dates || null,
        created_by: user.id,
        user_id: user.id,
        owner_id: user.id,
      };

      console.log('Task payload:', taskPayload);

      const { data, error } = await supabase
        .from('tasks')
        .insert(taskPayload)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      // Handle checklist items if present
      if (taskData.checklist && taskData.checklist.length > 0) {
        const checklistItems = taskData.checklist.map((item: any) => ({
          task_id: data.id,
          text: item.text,
          completed: item.completed || false,
        }));

        const { error: checklistError } = await supabase
          .from('checklist_items')
          .insert(checklistItems);

        if (checklistError) {
          console.error('Error creating checklist items:', checklistError);
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      showSuccessToast('Tarefa criada com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating task:', error);
      showErrorToast('Erro ao criar tarefa: ' + error.message);
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Task> }) => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('Updating task:', id, updates);
      
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .eq('created_by', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating task:', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      
      // Optimistic update
      queryClient.setQueryData(['tasks', user?.id], (old: Task[] | undefined) => {
        if (!old) return old;
        return old.map(task => 
          task.id === variables.id ? { ...task, ...variables.updates } : task
        );
      });
      
      if (variables.updates.status) {
        const statusText = variables.updates.status === 'done' ? 'concluída' : 'atualizada';
        showSuccessToast(`Tarefa ${statusText}!`);
      } else {
        showSuccessToast('Tarefa atualizada com sucesso!');
      }
    },
    onError: (error) => {
      console.error('Error updating task:', error);
      showErrorToast('Erro ao atualizar tarefa');
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('created_by', user.id);

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
