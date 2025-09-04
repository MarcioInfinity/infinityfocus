import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types';
import { toast } from 'sonner';

export function useTasks(projectId?: string) {
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      let query = supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Erro ao buscar tarefas:', error);
        throw error;
      }
      
      // Adicionar propriedades requeridas que podem vir do DB
      return (data || []).map((task: any) => ({
        ...task,
        checklist: task.checklist || [],
        notifications: task.notifications || [],
        tags: task.tags || [],
        created_by: task.user_id || task.created_by,
      })) as Task[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
  });

  const createTask = useMutation({
    mutationFn: async (taskData: Partial<Task>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const taskToCreate = {
        title: taskData.title || '',
        created_by: user.id,
        user_id: user.id,
        priority: taskData.priority || 'medium',
        category: taskData.category || 'professional',
        status: taskData.status || 'todo',
        notifications_enabled: taskData.notifications_enabled || false,
        repeat_enabled: taskData.repeat_enabled || false,
        ...taskData,
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert(taskToCreate)
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar tarefa:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (newTask) => {
      // Invalidar queries relacionadas de forma mais específica
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (newTask.project_id) {
        queryClient.invalidateQueries({ queryKey: ['tasks', newTask.project_id] });
      }
      toast.success('Tarefa criada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar tarefa:', error);
      toast.error('Erro ao criar tarefa. Tente novamente.');
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Task> }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar tarefa:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (updatedTask) => {
      // Invalidar queries relacionadas de forma mais específica
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (updatedTask.project_id) {
        queryClient.invalidateQueries({ queryKey: ['tasks', updatedTask.project_id] });
      }
      toast.success('Tarefa atualizada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar tarefa:', error);
      toast.error('Erro ao atualizar tarefa. Tente novamente.');
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir tarefa:', error);
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      // Invalidar todas as queries de tarefas
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Tarefa excluída com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao excluir tarefa:', error);
      toast.error('Erro ao excluir tarefa. Tente novamente.');
    },
  });

  const toggleTaskComplete = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({ 
          status: completed ? 'done' : 'todo',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao alterar status da tarefa:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (updatedTask) => {
      // Invalidar queries relacionadas de forma mais específica
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (updatedTask.project_id) {
        queryClient.invalidateQueries({ queryKey: ['tasks', updatedTask.project_id] });
      }
      toast.success(updatedTask.status === 'done' ? 'Tarefa concluída!' : 'Tarefa reaberta!');
    },
    onError: (error) => {
      console.error('Erro ao alterar status da tarefa:', error);
      toast.error('Erro ao alterar status da tarefa. Tente novamente.');
    },
  });

  // Lógica para filtrar tarefas para o Dashboard
  const getFilteredTasksForDashboard = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Resetar horas para comparação de datas

    const overdueTasks: Task[] = [];
    const dueTodayTasks: Task[] = [];
    const repeatingTodayTasks: Task[] = [];

    tasks.forEach(task => {
      if (task.status === 'done') return; // Ignorar tarefas concluídas

      const taskDueDate = task.due_date ? new Date(task.due_date) : null;
      if (taskDueDate) {
        taskDueDate.setHours(0, 0, 0, 0);
      }

      // 1. Tarefas Atrasadas
      if (taskDueDate && taskDueDate < today) {
        overdueTasks.push(task);
        return;
      }

      // 2. Tarefas do Dia (com data de vencimento hoje)
      if (taskDueDate && taskDueDate.toDateString() === today.toDateString()) {
        dueTodayTasks.push(task);
        return;
      }

      // 3. Tarefas com Repetição (que se aplicam a hoje)
      if (task.repeat_enabled) {
        const dayOfWeek = today.getDay().toString(); // 0 para Domingo, 1 para Segunda, etc.
        const dayOfMonth = today.getDate();

        switch (task.repeat_type) {
          case 'daily':
            repeatingTodayTasks.push(task);
            break;
          case 'weekly':
            if (task.repeat_days?.includes(dayOfWeek)) {
              repeatingTodayTasks.push(task);
            }
            break;
          case 'monthly':
            if (task.repeat_days?.includes(dayOfMonth.toString())) { // Assumindo que repeat_days guarda o dia do mês para mensal
              repeatingTodayTasks.push(task);
            }
            break;
          case 'custom':
            // Para custom, assumimos que 'custom_dates' é um array de datas específicas
            if (task.custom_dates?.some(dateStr => new Date(dateStr).toDateString() === today.toDateString())) {
              repeatingTodayTasks.push(task);
            }
            break;
          default:
            break;
        }
      }
    });

    return {
      overdueTasks,
      dueTodayTasks,
      repeatingTodayTasks,
    };
  };

  return {
    tasks,
    isLoading,
    error,
    createTask: createTask.mutate,
    updateTask: updateTask.mutate,
    deleteTask: deleteTask.mutate,
    toggleTaskComplete: toggleTaskComplete.mutate,
    isCreating: createTask.isPending,
    isUpdating: updateTask.isPending,
    isDeleting: deleteTask.isPending,
    isToggling: toggleTaskComplete.isPending,
    getFilteredTasksForDashboard,
  };
}
