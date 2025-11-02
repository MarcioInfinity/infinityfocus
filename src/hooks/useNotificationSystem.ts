import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

interface NotificationPayload {
  type: 'task_update' | 'goal_progress' | 'project_update' | 'reward_claimed';
  title: string;
  message: string;
  entity_id?: string;
  entity_type?: 'task' | 'goal' | 'project' | 'reward';
}

export function useNotificationSystem() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Subscribe to realtime notifications
    const channel = supabase
      .channel(`user-notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const notification = payload.new as any;
          
          if (notification && notification.message) {
            toast.info(notification.message, {
              description: notification.type === 'reminder' 
                ? 'Lembrete configurado' 
                : 'Nova notificação',
              duration: 5000,
            });
          }
        }
      )
      .subscribe();

    // Subscribe to goal progress updates
    const goalsChannel = supabase
      .channel(`user-goals:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'goals',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const oldGoal = payload.old as any;
          const newGoal = payload.new as any;
          
          // Check if progress changed
          if (oldGoal.progress !== newGoal.progress) {
            const progressDiff = newGoal.progress - oldGoal.progress;
            
            if (progressDiff > 0) {
              toast.success(`Meta atualizada: ${newGoal.name}`, {
                description: `Progresso: ${newGoal.progress}%`,
                duration: 4000,
              });
            }
            
            // Check if goal completed
            if (newGoal.progress === 100 && oldGoal.progress < 100) {
              toast.success(`🎉 Meta concluída: ${newGoal.name}!`, {
                description: 'Parabéns por completar sua meta!',
                duration: 6000,
              });
            }
          }
        }
      )
      .subscribe();

    // Subscribe to task updates
    const tasksChannel = supabase
      .channel(`user-tasks:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const oldTask = payload.old as any;
          const newTask = payload.new as any;
          
          // Check if status changed to done
          if (oldTask.status !== 'done' && newTask.status === 'done') {
            toast.success(`✅ Tarefa concluída: ${newTask.title}`, {
              duration: 4000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
      goalsChannel.unsubscribe();
      tasksChannel.unsubscribe();
    };
  }, [user]);

  const sendNotification = async (payload: NotificationPayload) => {
    if (!user) return;

    try {
      const { error } = await supabase.from('notifications').insert({
        user_id: user.id,
        type: payload.type,
        message: payload.message,
        scheduled_for: new Date().toISOString(),
        sent: true,
      });

      if (error) {
        console.error('Error sending notification:', error);
        return;
      }

      // Show toast immediately
      toast.info(payload.title, {
        description: payload.message,
        duration: 5000,
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  };

  return {
    sendNotification,
  };
}
