
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToastNotifications } from './use-toast-notifications';
import { Task, CategoryType } from '@/types';
import { toISOStringWithoutTimeZone, formatTime, convertCategoryToEnglish } from '@/lib/utils';

export function useTasks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useToastNotifications();

  const tasksQuery = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: async () => {
      if (!user) {
        console.log('User not authenticated, returning empty tasks array.');
        return [];
      }
      
      console.log('Attempting to fetch tasks for user:', user.id);
      
      // Corrigido: usar created_by que é o campo correto na tabela tasks
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tasks from Supabase:', error);
        throw error;
      }

      console.log('Tasks fetched successfully:', data?.length || 0, 'tasks.');
      
      // Transform data to match interface with default values
      return (data || []).map(task => ({
        ...task,
        checklist: [],
        notifications: [],
        tags: task.tags || []
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

      // Convert category to English and ensure it's a valid CategoryType
      const convertedCategory = convertCategoryToEnglish(taskData.category);
      const validCategory: CategoryType = convertedCategory || 'professional';

      const taskPayload = {
        title: taskData.title,
        description: taskData.description || null,
        priority: taskData.priority || 'medium',
        category: validCategory,
        status: 'todo' as const,
        due_date: taskData.due_date ? toISOStringWithoutTimeZone(new Date(taskData.due_date)) : null,
        start_date: taskData.start_date ? toISOStringWithoutTimeZone(new Date(taskData.start_date)) : null,
        start_time: taskData.time ? formatTime(taskData.time) : null,
        end_time: taskData.end_time ? formatTime(taskData.end_time) : null,
        is_indefinite: taskData.is_indefinite || false,
        assigned_to: taskData.assigned_to || null,
        project_id: taskData.project_id || null,
        goal_id: taskData.goal_id || null,
        tags: taskData.tags || [],
        notifications_enabled: taskData.notify_enabled || false,
        repeat_enabled: taskData.frequency_enabled || false,
        repeat_type: taskData.frequency_type || null,
        repeat_days: taskData.frequency_days ? taskData.frequency_days.map(String) : null,
        created_by: user.id, // Corrigido: usar apenas created_by
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
      // Corrigido: invalidar com a queryKey específica do usuário
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
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

      // Convert category to English and ensure it's a valid CategoryType
      const convertedCategory = updates.category ? convertCategoryToEnglish(updates.category) : updates.category;
      const validCategory: CategoryType | undefined = convertedCategory as CategoryType;

      const updatedPayload: any = {
        ...updates,
        category: validCategory,
        start_date: updates.start_date ? toISOStringWithoutTimeZone(new Date(updates.start_date)) : updates.start_date,
        due_date: updates.due_date ? toISOStringWithoutTimeZone(new Date(updates.due_date)) : updates.due_date,
        start_time: updates.start_time ? formatTime(updates.start_time) : updates.start_time,
        end_time: updates.end_time ? formatTime(updates.end_time) : updates.end_time,
      };
      
      const { data, error } = await supabase
        .from('tasks')
        .update(updatedPayload)
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
      // Corrigido: invalidar com a queryKey específica do usuário
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
      
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
      showErrorToast('Erro ao atualizar tarefa: ' + error.message);
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
      // Corrigido: invalidar com a queryKey específica do usuário
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
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
