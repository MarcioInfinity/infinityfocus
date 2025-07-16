
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, X, Users, Calendar, AlertCircle } from 'lucide-react';
import { useProjectInvites } from '@/hooks/useProjectInvites';
import { useAuth } from '@/hooks/useAuth';

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getInviteByToken, acceptInviteAsync, isAcceptingInvite } = useProjectInvites();
  const [acceptedSuccessfully, setAcceptedSuccessfully] = useState(false);

  const { data: invite, isLoading, error } = getInviteByToken(token || '');

  useEffect(() => {
    if (!user) {
      // Redirecionar para login se não estiver autenticado
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
    }
  }, [user, navigate]);

  const handleAcceptInvite = async () => {
    if (!token || !user) return;

    try {
      await acceptInviteAsync({ token });
      setAcceptedSuccessfully(true);
      
      // Redirecionar para a página de projetos após 2 segundos
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Error accepting invite:', error);
    }
  };

  const handleDeclineInvite = () => {
    navigate('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Card className="glass-card w-full max-w-md">
          <CardContent className="text-center py-12">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
            <h2 className="text-xl font-semibold mb-2">Autenticação Necessária</h2>
            <p className="text-muted-foreground mb-4">
              Você precisa estar logado para aceitar este convite.
            </p>
            <Button onClick={() => navigate('/login')} className="glow-button">
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Card className="glass-card w-full max-w-md">
          <CardContent className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Verificando convite...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !invite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Card className="glass-card w-full max-w-md">
          <CardContent className="text-center py-12">
            <X className="w-16 h-16 mx-auto mb-4 text-red-400" />
            <h2 className="text-xl font-semibold mb-2">Convite Inválido</h2>
            <p className="text-muted-foreground mb-4">
              Este convite pode ter expirado, já ter sido usado ou não existe.
            </p>
            <Button onClick={() => navigate('/')} variant="outline" className="neon-border">
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (acceptedSuccessfully) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Card className="glass-card w-full max-w-md">
          <CardContent className="text-center py-12">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
            <h2 className="text-xl font-semibold mb-2">Convite Aceito!</h2>
            <p className="text-muted-foreground mb-4">
              Bem-vindo ao projeto {invite.projects?.name}! 
              Você será redirecionado em instantes...
            </p>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const roleLabels = {
    admin: { label: '🛡️ Administrador', description: 'Pode gerenciar o projeto e membros' },
    member: { label: '👤 Membro', description: 'Pode criar e editar tarefas' },
    viewer: { label: '👁️ Visualizador', description: 'Pode apenas visualizar o projeto' }
  };

  const roleInfo = roleLabels[invite.role as keyof typeof roleLabels];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Card className="glass-card w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-center text-xl">
            Convite para Projeto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Informações do Projeto */}
          <div className="text-center space-y-3">
            <div 
              className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-2xl font-bold text-white"
              style={{ backgroundColor: invite.projects?.color || '#3B82F6' }}
            >
              {invite.projects?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-semibold">{invite.projects?.name}</h3>
              {invite.projects?.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {invite.projects.description}
                </p>
              )}
            </div>
          </div>

          {/* Informações da Função */}
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Você será adicionado como:</span>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="text-sm px-3 py-1">
                {roleInfo.label}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">
                {roleInfo.description}
              </p>
            </div>
          </div>

          {/* Informações do Convite */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                Convite expira em: {new Date(invite.expires_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
            {invite.email && (
              <p className="text-xs text-muted-foreground">
                Convite enviado para: {invite.email}
              </p>
            )}
          </div>

          {/* Ações */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleDeclineInvite}
              className="flex-1 neon-border"
            >
              Recusar
            </Button>
            <Button
              onClick={handleAcceptInvite}
              disabled={isAcceptingInvite}
              className="flex-1 glow-button"
            >
              {isAcceptingInvite ? 'Aceitando...' : 'Aceitar Convite'}
            </Button>
          </div>

          <div className="text-xs text-center text-muted-foreground">
            Ao aceitar este convite, você terá acesso ao projeto e suas tarefas.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
