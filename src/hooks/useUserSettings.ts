
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToastNotifications } from './use-toast-notifications';

interface UserSettings {
  id: string;
  user_id: string;
  timezone: string;
  date_format: string;
  time_format: string;
  created_at: string;
  updated_at: string;
}

export function useUserSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useToastNotifications();

  const settingsQuery = useQuery({
    queryKey: ['user-settings', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    },
    enabled: !!user,
  });

  const createSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<UserSettings>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_settings')
        .insert({
          user_id: user.id,
          ...settings,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
      showSuccessToast('Configurações criadas com sucesso!');
    },
    onError: (error) => {
      console.error('Error creating settings:', error);
      showErrorToast('Erro ao criar configurações');
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<UserSettings>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_settings')
        .update(settings)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
      showSuccessToast('Configurações atualizadas com sucesso!');
    },
    onError: (error) => {
      console.error('Error updating settings:', error);
      showErrorToast('Erro ao atualizar configurações');
    },
  });

  const saveSettings = (settings: Partial<UserSettings>) => {
    if (settingsQuery.data) {
      updateSettingsMutation.mutate(settings);
    } else {
      createSettingsMutation.mutate(settings);
    }
  };

  return {
    settings: settingsQuery.data,
    isLoading: settingsQuery.isLoading,
    error: settingsQuery.error,
    saveSettings,
    isSaving: createSettingsMutation.isPending || updateSettingsMutation.isPending,
  };
}
