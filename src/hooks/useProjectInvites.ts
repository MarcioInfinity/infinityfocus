
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
      if (!user) throw new Error('Usuário não autenticado');

      console.log('Creating invite:', { projectId, email, role });

      const token = generateInviteToken();
      
      // Criar o convite no banco de dados
      const { data: inviteData, error: inviteError } = await supabase
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

      if (inviteError) {
        console.error('Error creating invite record:', inviteError);
        throw new Error('Erro ao criar convite: ' + inviteError.message);
      }

      console.log('Invite record created:', inviteData);

      // Se foi fornecido email, tentar enviar convite por email
      if (email) {
        try {
          const inviteLink = `${window.location.origin}/invite/${token}`;
          
          // Buscar dados do projeto e do usuário criador
          const { data: projectData, error: projectError } = await supabase
            .from('projects')
            .select('name, owner_id')
            .eq('id', projectId)
            .single();

          if (projectError) {
            console.error('Error fetching project data:', projectError);
            showErrorToast('Convite criado, mas erro ao buscar dados do projeto');
            return inviteData;
          }

          const { data: ownerData, error: ownerError } = await supabase
            .from('profiles')
            .select('name')
            .eq('user_id', projectData.owner_id)
            .single();

          if (ownerError) {
            console.error('Error fetching owner data:', ownerError);
            showErrorToast('Convite criado, mas erro ao buscar dados do proprietário');
            return inviteData;
          }

          console.log('Sending email with data:', {
            email,
            projectName: projectData.name,
            inviterName: ownerData.name,
            role,
            inviteLink
          });

          const { data: emailData, error: emailError } = await supabase.functions.invoke('send-invite-email', {
            body: {
              email,
              projectName: projectData.name,
              inviterName: ownerData.name,
              role,
              inviteLink,
            },
          });

          if (emailError) {
            console.error('Error sending email:', emailError);
            showErrorToast('Convite criado, mas erro ao enviar email: ' + emailError.message);
          } else {
            console.log('Email sent successfully:', emailData);
            showSuccessToast(`Convite enviado para ${email} com sucesso!`);
          }
        } catch (emailSendError) {
          console.error('Exception while sending email:', emailSendError);
          showErrorToast('Convite criado, mas erro inesperado ao enviar email');
        }
      } else {
        showSuccessToast('Link de convite criado com sucesso!');
      }

      return inviteData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-invites'] });
    },
    onError: (error: Error) => {
      console.error('Error in createInviteMutation:', error);
      showErrorToast(error.message || 'Erro ao criar convite');
    },
  });

  const getProjectInvites = (projectId: string) => {
    return useQuery({
      queryKey: ['project-invites', projectId],
      queryFn: async () => {
        if (!projectId || !user) return [];

        console.log('Fetching invites for project:', projectId);

        const { data, error } = await supabase
          .from('project_invites')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching project invites:', error);
          throw error;
        }

        console.log('Project invites fetched:', data);
        return data || [];
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
