
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { useProjectInvites } from '@/hooks/useProjectInvites';
import { useAuth } from '@/hooks/useAuth';

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getInviteByToken, acceptInviteAsync, isAcceptingInvite } = useProjectInvites();
  const [isAccepted, setIsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inviteQuery = getInviteByToken(token || '');
  const invite = inviteQuery.data;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  const handleAcceptInvite = async () => {
    if (!token || !user) return;

    try {
      setError(null);
      await acceptInviteAsync({ token });
      setIsAccepted(true);
      
      // Redirect to projects after a short delay
      setTimeout(() => {
        navigate('/projects');
      }, 2000);
    } catch (error: any) {
      console.error('Error accepting invite:', error);
      setError(error.message || 'Erro ao aceitar convite');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/80 flex items-center justify-center p-4">
        <Card className="glass-card max-w-md w-full">
          <CardContent className="p-6 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Redirecionando para login...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (inviteQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/80 flex items-center justify-center p-4">
        <Card className="glass-card max-w-md w-full">
          <CardContent className="p-6 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Carregando convite...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invite || inviteQuery.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/80 flex items-center justify-center p-4">
        <Card className="glass-card max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              Convite Inválido
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Este convite é inválido, já foi usado ou expirou.
            </p>
            <Button onClick={() => navigate('/projects')} className="w-full">
              Voltar aos Projetos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isAccepted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/80 flex items-center justify-center p-4">
        <Card className="glass-card max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-400">
              <CheckCircle className="w-5 h-5" />
              Convite Aceito!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Você agora faz parte do projeto <strong>{invite.projects?.name}</strong>!
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecionando para projetos...
            </p>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-gradient-to-r from-primary to-accent h-2 rounded-full animate-pulse" style={{ width: '100%' }} />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80 flex items-center justify-center p-4">
      <Card className="glass-card max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-center">Convite de Projeto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div 
              className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-2xl font-bold text-white"
              style={{ backgroundColor: invite.projects?.color || '#3B82F6' }}
            >
              {invite.projects?.name?.charAt(0)?.toUpperCase() || 'P'}
            </div>
            
            <div>
              <h2 className="text-xl font-semibold">{invite.projects?.name}</h2>
              {invite.projects?.description && (
                <p className="text-muted-foreground mt-2">
                  {invite.projects.description}
                </p>
              )}
            </div>

            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>Papel:</span>
                <Badge variant="secondary" className="ml-1">
                  {invite.role === 'admin' ? 'Administrador' : 
                   invite.role === 'member' ? 'Membro' : 'Visualizador'}
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>
                Expira em: {new Date(invite.expires_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <Button 
              onClick={handleAcceptInvite}
              disabled={isAcceptingInvite}
              className="w-full glow-button"
              size="lg"
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
              onClick={() => navigate('/projects')}
              className="w-full"
            >
              Cancelar
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Ao aceitar este convite, você terá acesso ao projeto e suas funcionalidades 
            de acordo com seu nível de permissão.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
