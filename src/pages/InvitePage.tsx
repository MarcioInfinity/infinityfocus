import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { useProjectInvites } from '@/hooks/useProjectInvites';
import { useAuth } from '@/hooks/useAuth';
import { useToastNotifications } from '@/hooks/use-toast-notifications';

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getInviteByToken, acceptInvite, isAcceptingInvite } = useProjectInvites();
  const { showSuccessToast, showErrorToast } = useToastNotifications();
  const [isAccepted, setIsAccepted] = useState(false);

  const inviteQuery = getInviteByToken(token || '');
  const invite = inviteQuery.data;

  useEffect(() => {
    // Salvar o token no localStorage antes de redirecionar para login
    if (token && !user) {
      localStorage.setItem('pendingInviteToken', token);
      navigate('/login');
      return;
    }

    // Se o usuário está logado e há um token pendente, processar o convite
    if (user && token) {
      const pendingToken = localStorage.getItem('pendingInviteToken');
      if (pendingToken === token) {
        localStorage.removeItem('pendingInviteToken');
      }
    }
  }, [user, navigate, token]);

  const handleAcceptInvite = async () => {
    if (!token || !user) return;

    try {
      await acceptInvite({ token });
      setIsAccepted(true);
      showSuccessToast('Convite aceito com sucesso!');
      
      // Redirect to projects after a short delay
      setTimeout(() => {
        navigate('/projects');
      }, 2000);
    } catch (error) {
      console.error('Error accepting invite:', error);
      showErrorToast('Erro ao aceitar convite');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/80 flex items-center justify-center p-4">
        <Card className="glass-card w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Users className="w-6 h-6" />
              Convite para Projeto
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
            <p className="text-muted-foreground">
              Redirecionando para o login...
            </p>
            <p className="text-sm text-muted-foreground">
              Você será redirecionado de volta para aceitar o convite após fazer login.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (inviteQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/80 flex items-center justify-center p-4">
        <Card className="glass-card w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground">Carregando convite...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invite) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/80 flex items-center justify-center p-4">
        <Card className="glass-card w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-red-400">
              <AlertCircle className="w-6 h-6" />
              Convite Inválido
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Este convite é inválido, expirado ou já foi utilizado.
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              Ir para Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isAccepted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/80 flex items-center justify-center p-4">
        <Card className="glass-card w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-green-400">
              <CheckCircle className="w-6 h-6" />
              Convite Aceito!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Você foi adicionado ao projeto com sucesso!
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecionando para seus projetos...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80 flex items-center justify-center p-4">
      <Card className="glass-card w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Users className="w-6 h-6" />
            Convite para Projeto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">{invite.projects?.name}</h3>
              {invite.projects?.description && (
                <p className="text-muted-foreground text-sm">
                  {invite.projects.description}
                </p>
              )}
            </div>

            <div className="flex items-center justify-center gap-2">
              <Badge variant="outline" className="capitalize">
                {invite.role === 'admin' ? 'Administrador' : 
                 invite.role === 'member' ? 'Membro' : 'Visualizador'}
              </Badge>
              {invite.projects?.color && (
                <div 
                  className="w-4 h-4 rounded-full border-2 border-white/20"
                  style={{ backgroundColor: invite.projects.color }}
                />
              )}
            </div>

            <div className="text-sm text-muted-foreground space-y-1">
              <div className="flex items-center justify-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  Convite criado em {new Date(invite.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
              {invite.email && (
                <p>Enviado para: {invite.email}</p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleAcceptInvite} 
              disabled={isAcceptingInvite}
              className="w-full"
            >
              {isAcceptingInvite ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Aceitando...
                </>
              ) : (
                'Aceitar Convite'
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="w-full"
            >
              Cancelar
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            Ao aceitar este convite, você terá acesso ao projeto e suas tarefas.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
