import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useRealtime() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    console.log('Setting up realtime subscriptions for user:', user.id);

    // Canal para projetos
    const projectsChannel = supabase
      .channel('projects-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects'
        },
        (payload) => {
          console.log('Projects realtime update:', payload);
          // Corrigido: invalidar com a queryKey específica do usuário
          queryClient.invalidateQueries({ queryKey: ['projects', user.id] });
        }
      )
      .subscribe();

    // Canal para tarefas
    const tasksChannel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks'
        },
        (payload) => {
          console.log('Tasks realtime update:', payload);
          // Corrigido: invalidar com a queryKey específica do usuário
          queryClient.invalidateQueries({ queryKey: ['tasks', user.id] });
        }
      )
      .subscribe();

    // Canal para metas
    const goalsChannel = supabase
      .channel('goals-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'goals'
        },
        (payload) => {
          console.log('Goals realtime update:', payload);
          // Corrigido: invalidar com a queryKey específica do usuário
          queryClient.invalidateQueries({ queryKey: ['goals', user.id] });
        }
      )
      .subscribe();

    // Canal para membros de projeto
    const membersChannel = supabase
      .channel('project-members-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_members'
        },
        (payload) => {
          console.log('Project members realtime update:', payload);
          // Corrigido: invalidar com a queryKey específica do usuário
          queryClient.invalidateQueries({ queryKey: ['projects', user.id] });
          queryClient.invalidateQueries({ queryKey: ['project-invites', user.id] });
        }
      )
      .subscribe();

    // Canal para convites
    const invitesChannel = supabase
      .channel('project-invites-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_invites'
        },
        (payload) => {
          console.log('Project invites realtime update:', payload);
          // Corrigido: invalidar com a queryKey específica do usuário
          queryClient.invalidateQueries({ queryKey: ['project-invites', user.id] });
        }
      )
      .subscribe();

    // Canal para itens de checklist
    const checklistChannel = supabase
      .channel('checklist-items-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'checklist_items'
        },
        (payload) => {
          console.log('Checklist items realtime update:', payload);
          // Corrigido: invalidar com a queryKey específica do usuário
          queryClient.invalidateQueries({ queryKey: ['tasks', user.id] });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up realtime subscriptions');
      supabase.removeChannel(projectsChannel);
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(goalsChannel);
      supabase.removeChannel(membersChannel);
      supabase.removeChannel(invitesChannel);
      supabase.removeChannel(checklistChannel);
    };
  }, [user, queryClient]);
}

