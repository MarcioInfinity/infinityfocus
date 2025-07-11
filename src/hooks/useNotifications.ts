import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToastNotifications } from './use-toast-notifications';
import { CustomNotification } from '@/types';

export function useNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useToastNotifications();

  const notificationsQuery = useQuery({
    queryKey: ['custom-notifications', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('custom_notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
      }

      return data as CustomNotification[];
    },
    enabled: !!user,
  });

  const createNotificationMutation = useMutation({
    mutationFn: async (notificationData: Partial<CustomNotification>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('custom_notifications')
        .insert({
          task_id: notificationData.task_id!,
          type: notificationData.type!,
          message: notificationData.message!,
          time: notificationData.time,
          days_of_week: notificationData.days_of_week,
          specific_date: notificationData.specific_date,
          is_active: notificationData.is_active ?? true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-notifications'] });
      showSuccessToast('Notificação criada com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating notification:', error);
      showErrorToast('Erro ao criar notificação');
    },
  });

  const updateNotificationMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CustomNotification> }) => {
      const { data, error } = await supabase
        .from('custom_notifications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-notifications'] });
      showSuccessToast('Notificação atualizada com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating notification:', error);
      showErrorToast('Erro ao atualizar notificação');
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('custom_notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-notifications'] });
      showSuccessToast('Notificação excluída com sucesso!');
    },
    onError: (error) => {
      console.error('Error deleting notification:', error);
      showErrorToast('Erro ao excluir notificação');
    },
  });

  // Function to request browser notification permission
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      throw new Error('Este navegador não suporta notificações');
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  };

  // Function to show browser notification
  const showBrowserNotification = (title: string, options?: NotificationOptions) => {
    if (Notification.permission === 'granted') {
      return new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
    }
  };

  return {
    notifications: notificationsQuery.data || [],
    isLoading: notificationsQuery.isLoading,
    error: notificationsQuery.error,
    createNotification: createNotificationMutation.mutate,
    updateNotification: updateNotificationMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
    isCreating: createNotificationMutation.isPending,
    isUpdating: updateNotificationMutation.isPending,
    isDeleting: deleteNotificationMutation.isPending,
    requestNotificationPermission,
    showBrowserNotification,
  };
}