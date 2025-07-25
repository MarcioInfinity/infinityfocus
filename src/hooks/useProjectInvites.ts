import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToastNotifications } from './use-toast-notifications';

interface CreateInviteData {
  projectId: string;
  email?: string;
  role: 'admin' | 'member' | 'viewer';
}

interface AcceptInviteData {
  token: string;
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
      
      // Generate invite link first
      const inviteLink = `${window.location.origin}/invite/${token}`;
      
      // Create invite in database
      const { data: inviteData, error: inviteError } = await supabase
        .from('project_invites')
        .insert({
          project_id: projectId,
          token,
          email,
          role,
          created_by: user.id,
          invite_link: inviteLink,
        })
        .select()
        .single();

      if (inviteError) {
        console.error('Error creating invite record:', inviteError);
        throw new Error('Erro ao criar convite: ' + inviteError.message);
      }

      console.log('Invite record created:', inviteData);

      // Send email if provided
      if (email) {
        try {
          const { data: projectData, error: projectError } = await supabase
            .from('projects')
            .select('name, owner_id')
            .eq('id', projectId)
            .single();

          if (projectError) {
            console.error('Error fetching project data:', projectError);
            showErrorToast('Convite criado, mas erro ao buscar dados do projeto');
            return { ...inviteData, inviteLink };
          }

          const { data: ownerData, error: ownerError } = await supabase
            .from('profiles')
            .select('name')
            .eq('user_id', projectData.owner_id)
            .single();

          const ownerName = ownerData?.name || 'Usuário';

          console.log('Sending email with data:', {
            email,
            projectName: projectData.name,
            inviterName: ownerName,
            role,
            inviteLink
          });

          const { data: emailData, error: emailError } = await supabase.functions.invoke('send-invite-email', {
            body: {
              email,
              projectName: projectData.name,
              inviterName: ownerName,
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

      return { ...inviteData, inviteLink };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-invites'] });
    },
    onError: (error: Error) => {
      console.error('Error in createInviteMutation:', error);
      showErrorToast(error.message || 'Erro ao criar convite');
    },
  });

  const acceptInviteMutation = useMutation({
    mutationFn: async ({ token }: AcceptInviteData) => {
      if (!user) throw new Error('Usuário não autenticado');

      console.log('Accepting invite with token:', token);

      // Buscar convite válido
      const { data: inviteData, error: inviteError } = await supabase
        .from('project_invites')
        .select('*, projects(name)')
        .eq('token', token)
        .gt('expires_at', new Date().toISOString())
        .is('used_at', null)
        .single();

      if (inviteError || !inviteData) {
        throw new Error('Convite inválido, expirado ou já utilizado');
      }

      // Verificar se o usuário já é membro
      const { data: existingMember } = await supabase
        .from('project_members')
        .select('id')
        .eq('project_id', inviteData.project_id)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        throw new Error('Você já é membro deste projeto');
      }

      // Adicionar membro ao projeto
      const { error: memberError } = await supabase
        .from('project_members')
        .insert({
          project_id: inviteData.project_id,
          user_id: user.id,
          role: inviteData.role,
        });

      if (memberError) {
        throw new Error('Erro ao adicionar membro ao projeto: ' + memberError.message);
      }

      // Marcar convite como usado
      const { error: updateError } = await supabase
        .from('project_invites')
        .update({ used_at: new Date().toISOString() })
        .eq('id', inviteData.id);

      if (updateError) {
        console.error('Error updating invite:', updateError);
      }

      return inviteData;
    },
    onSuccess: (inviteData) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project-invites'] });
      showSuccessToast(`Bem-vindo ao projeto ${inviteData.projects?.name}!`);
    },
    onError: (error: Error) => {
      console.error('Error accepting invite:', error);
      showErrorToast(error.message || 'Erro ao aceitar convite');
    },
  });

  return {
    createInvite: createInviteMutation.mutate,
    createInviteAsync: createInviteMutation.mutateAsync,
    acceptInvite: acceptInviteMutation.mutate,
    acceptInviteAsync: acceptInviteMutation.mutateAsync,
    isCreatingInvite: createInviteMutation.isPending,
    isAcceptingInvite: acceptInviteMutation.isPending,
  };
}

export function useGetProjectInvites(projectId: string) {
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
}

export function useGetInviteByToken(token: string) {
    return useQuery({
      queryKey: ['invite-by-token', token],
      queryFn: async () => {
        if (!token) return null;

        console.log('Fetching invite by token:', token);

        const { data, error } = await supabase
          .from('project_invites')
          .select(`
            *,
            projects (
              id,
              name,
              description,
              color
            )
          `)
          .eq('token', token)
          .gt('expires_at', new Date().toISOString())
          .is('used_at', null)
          .single();

        if (error) {
          console.error('Error fetching invite by token:', error);
          return null;
        }

        console.log('Invite by token fetched:', data);
        return data;
      },
      enabled: !!token,
    });

  return {
    createInvite: createInviteMutation.mutate,
    createInviteAsync: createInviteMutation.mutateAsync,
    acceptInvite: acceptInviteMutation.mutate,
    acceptInviteAsync: acceptInviteMutation.mutateAsync,
    isCreatingInvite: createInviteMutation.isPending,
    isAcceptingInvite: acceptInviteMutation.isPending,
  };
}
