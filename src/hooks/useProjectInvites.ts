
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToastNotifications } from './use-toast-notifications';

interface CreateInviteData {
  projectId: string;
  email?: string;
  role: 'admin' | 'member' | 'viewer';
}

export function useProjectInvites() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useToastNotifications();

  const generateInviteToken = (): string => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15) + 
           Date.now().toString(36);
  };

  const createInviteMutation = useMutation({
    mutationFn: async ({ projectId, email, role }: CreateInviteData) => {
      if (!user) throw new Error('User not authenticated');

      const token = generateInviteToken();
      
      const { data, error } = await supabase
        .from('project_invites')
        .insert({
          project_id: projectId,
          token,
          email,
          role,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Se foi fornecido email, enviar convite por email
      if (email) {
        const inviteLink = `${window.location.origin}/invite/${token}`;
        
        // Buscar dados do projeto e do usuário
        const { data: projectData } = await supabase
          .from('projects')
          .select(`
            name,
            profiles!inner (name)
          `)
          .eq('id', projectId)
          .single();

        if (projectData) {
          const { error: emailError } = await supabase.functions.invoke('send-invite-email', {
            body: {
              email,
              projectName: projectData.name,
              inviterName: projectData.profiles.name,
              role,
              inviteLink,
            },
          });

          if (emailError) {
            console.error('Error sending email:', emailError);
            showErrorToast('Convite criado, mas erro ao enviar email');
          }
        }
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['project-invites'] });
      const inviteLink = `${window.location.origin}/invite/${data.token}`;
      showSuccessToast('Convite criado com sucesso!');
      return inviteLink;
    },
    onError: (error) => {
      console.error('Error creating invite:', error);
      showErrorToast('Erro ao criar convite');
    },
  });

  const getProjectInvites = (projectId: string) => {
    return useQuery({
      queryKey: ['project-invites', projectId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('project_invites')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
      },
      enabled: !!projectId && !!user,
    });
  };

  return {
    createInvite: createInviteMutation.mutate,
    createInviteAsync: createInviteMutation.mutateAsync,
    isCreatingInvite: createInviteMutation.isPending,
    getProjectInvites,
  };
}
