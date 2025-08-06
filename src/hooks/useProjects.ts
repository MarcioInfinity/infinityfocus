import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Project } from '@/types';
import { toast } from 'sonner';

export function useProjects() {
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar projetos:', error);
        throw error;
      }
      
      // Adicionar propriedades requeridas que podem vir do DB
      return (data || []).map(project => ({
        ...project,
        members: project.members || [],
        tasks: project.tasks || [],
        checklist: project.checklist || [],
        owner_id: project.user_id || project.owner_id,
      }));
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    gcTime: 1000 * 60 * 10, // 10 minutos
  });

  const createProject = useMutation({
    mutationFn: async (projectData: Partial<Project>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Mapear campos corretamente
      const mappedData = {
        ...projectData,
        user_id: user.id,
        start_time: projectData.start_time || null,
        end_time: projectData.end_time || null,
      };

      const { data, error } = await supabase
        .from('projects')
        .insert([mappedData])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar projeto:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Projeto criado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar projeto:', error);
      toast.error('Erro ao criar projeto. Tente novamente.');
    },
  });

  const updateProject = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Project> }) => {
      // Mapear campos corretamente
      const mappedUpdates = {
        ...updates,
        start_time: updates.start_time || null,
        end_time: updates.end_time || null,
      };

      const { data, error } = await supabase
        .from('projects')
        .update(mappedUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar projeto:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Projeto atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar projeto:', error);
      toast.error('Erro ao atualizar projeto. Tente novamente.');
    },
  });

  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir projeto:', error);
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Projeto excluído com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao excluir projeto:', error);
      toast.error('Erro ao excluir projeto. Tente novamente.');
    },
  });

  const toggleProjectComplete = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { data, error } = await supabase
        .from('projects')
        .update({ 
          completed,
          completed_at: completed ? new Date().toISOString() : null 
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao alterar status do projeto:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (updatedProject) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success(updatedProject.completed ? 'Projeto concluído!' : 'Projeto reaberto!');
    },
    onError: (error) => {
      console.error('Erro ao alterar status do projeto:', error);
      toast.error('Erro ao alterar status do projeto. Tente novamente.');
    },
  });

  return {
    projects,
    isLoading,
    error,
    createProject: createProject.mutate,
    updateProject: updateProject.mutate,
    deleteProject: deleteProject.mutate,
    toggleProjectComplete: toggleProjectComplete.mutate,
    isCreating: createProject.isPending,
    isUpdating: updateProject.isPending,
    isDeleting: deleteProject.isPending,
    isToggling: toggleProjectComplete.isPending,
  };
}
