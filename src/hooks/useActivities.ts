
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Activity } from '@/types';

export function useActivities(parentId: string, parentType: 'task' | 'project' | 'goal') {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const activitiesQuery = useQuery({
    queryKey: ['activities', parentId, parentType],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('parent_id', parentId)
        .eq('parent_type', parentType)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Activity[];
    },
    enabled: !!user && !!parentId,
  });

  const createActivityMutation = useMutation({
    mutationFn: async (data: { action: string; description: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('activities')
        .insert({
          parent_id: parentId,
          parent_type: parentType,
          action: data.action,
          description: data.description,
          created_by: user.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', parentId, parentType] });
    },
  });

  return {
    activities: activitiesQuery.data || [],
    isLoading: activitiesQuery.isLoading,
    logActivity: createActivityMutation.mutate,
  };
}
