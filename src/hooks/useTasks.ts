import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToastNotifications } from './use-toast-notifications';
import { Task } from '@/types';

export function useTasksImproved() {
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

      // CORREÇÃO #1: Melhorar o mapeamento dos dados de repetição
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
        notifications_enabled: taskData.notify_enabled || false,
        
        // CORREÇÃO: Campos de repetição corrigidos
        repeat_enabled: taskData.repeat_enabled || false,
        repeat_type: taskData.repeat_type || null,
        repeat_days: taskData.repeat_days || null,
        repeat_monthly_day: taskData.repeat_monthly_day || null,
        repeat_custom_dates: taskData.repeat_custom_dates || null,
        
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

  // CORREÇÃO #2: Função melhorada para filtrar tarefas do dia
  const getTodayTasks = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalizar para o início do dia
    const currentWeekday = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const currentMonthDay = today.getDate();
    
    return (tasksQuery.data || []).filter(task => {
      // Ignorar tarefas concluídas
      if (task.status === 'done') return false;

      // 1. Tarefas com data de término no passado (atrasadas)
      if (task.due_date) {
        const dueDate = new Date(task.due_date);
        dueDate.setHours(0, 0, 0, 0);
        if (dueDate < today) {
          return true; // Tarefa atrasada
        }
      }

      // 2. Tarefas com data de início ou término para hoje
      const isToday = (dateString: string | undefined) => {
        if (!dateString) return false;
        const date = new Date(dateString);
        date.setHours(0, 0, 0, 0);
        return date.getTime() === today.getTime();
      };

      if (isToday(task.start_date) || isToday(task.due_date)) {
        return true;
      }

      // 3. Tarefas com repetição que se aplicam a hoje
      if (task.repeat_enabled) {
        switch (task.repeat_type) {
          case 'daily':
            return true;
          case 'weekly':
            // CORREÇÃO: Verificar se repeat_days é array de strings ou números
            const repeatDaysWeekly = Array.isArray(task.repeat_days) 
              ? task.repeat_days.map(d => typeof d === 'string' ? parseInt(d) : d) 
              : [];
            return repeatDaysWeekly.includes(currentWeekday);
          case 'monthly':
            return task.repeat_monthly_day === currentMonthDay;
          case 'custom':
            // CORREÇÃO: Verificar datas personalizadas
            const repeatCustomDates = Array.isArray(task.repeat_custom_dates) 
              ? task.repeat_custom_dates.map(d => new Date(d)) 
              : [];
            return repeatCustomDates.some(d => {
              d.setHours(0, 0, 0, 0);
              return d.getTime() === today.getTime();
            });
          default:
            return false;
        }
      }
      
      return false;
    }).sort((a, b) => {
      // Prioridade: Alta > Média > Baixa
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      if (priorityDiff !== 0) return priorityDiff;

      // Tarefas atrasadas primeiro
      const aIsOverdue = a.due_date && new Date(a.due_date).setHours(0,0,0,0) < today.getTime();
      const bIsOverdue = b.due_date && new Date(b.due_date).setHours(0,0,0,0) < today.getTime();
      if (aIsOverdue && !bIsOverdue) return -1;
      if (!aIsOverdue && bIsOverdue) return 1;

      // Depois por horário (se disponível)
      if (a.start_time && b.start_time) {
        return a.start_time.localeCompare(b.start_time);
      }
      if (a.start_time && !b.start_time) return -1;
      if (!a.start_time && b.start_time) return 1;
      
      // Finalmente por data de término (mais próxima primeiro)
      if (a.due_date && b.due_date) {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      if (a.due_date && !b.due_date) return -1;
      if (!a.due_date && b.due_date) return 1;

      return 0;
    });
  };

  return {
    tasks: tasksQuery.data || [],
    todayTasks: getTodayTasks(),
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

