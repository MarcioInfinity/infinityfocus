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
      
      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
  });

  const createTask = useMutation({
    mutationFn: async (taskData: Partial<Task>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('tasks')
        .insert([{ ...taskData, user_id: user.id }])
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
          completed,
          completed_at: completed ? new Date().toISOString() : null 
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
      toast.success(updatedTask.completed ? 'Tarefa concluída!' : 'Tarefa reaberta!');
    },
    onError: (error) => {
      console.error('Erro ao alterar status da tarefa:', error);
      toast.error('Erro ao alterar status da tarefa. Tente novamente.');
    },
  });

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
  };
}
