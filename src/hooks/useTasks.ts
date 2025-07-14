
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
    mutationFn: async (taskData: any) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Creating task with data:', taskData);

      // Mapear os campos do formulário para os campos do banco
      const taskPayload = {
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority || 'medium',
        category: taskData.category || 'professional',
        status: 'todo' as const,
        due_date: taskData.due_date,
        start_date: taskData.start_date,
        start_time: taskData.time, // Mapear 'time' para 'start_time'
        end_time: taskData.end_time,
        is_indefinite: taskData.is_indefinite || false,
        assigned_to: taskData.assigned_to,
        project_id: taskData.project_id,
        goal_id: taskData.goal_id,
        tags: taskData.tags || [],
        notifications_enabled: taskData.notify_enabled || false, // Corrigir mapeamento
        repeat_enabled: taskData.frequency_enabled || false, // Corrigir mapeamento
        repeat_type: taskData.frequency_type, // Corrigir mapeamento
        repeat_days: taskData.frequency_days ? taskData.frequency_days.map(String) : null, // Converter para string array
        created_by: user.id,
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

      // Se há checklist, criar os itens separadamente
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
          // Não falhar a criação da tarefa por causa do checklist
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
