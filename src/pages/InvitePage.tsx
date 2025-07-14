
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserPlus, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useToastNotifications } from '@/hooks/use-toast-notifications';

interface InviteData {
  id: string;
  project: {
    name: string;
    description: string;
    owner: {
      name: string;
      email: string;
    };
  };
  role: string;
  expires_at: string;
  used_at: string | null;
}

export function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showSuccessToast, showErrorToast } = useToastNotifications();
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Token de convite inválido');
      setLoading(false);
      return;
    }

    loadInvite();
  }, [token]);

  const loadInvite = async () => {
    try {
      const { data, error } = await supabase
        .from('project_invites')
        .select(`
          id,
          role,
          expires_at,
          used_at,
          projects!inner (
            name,
            description,
            profiles!inner (
              name,
              email
            )
          )
        `)
        .eq('token', token)
        .single();

      if (error) {
        setError('Convite não encontrado ou expirado');
        return;
      }

      if (data.used_at) {
        setError('Este convite já foi utilizado');
        return;
      }

      if (new Date(data.expires_at) < new Date()) {
        setError('Este convite expirou');
        return;
      }

      setInvite({
        id: data.id,
        project: {
          name: data.projects.name,
          description: data.projects.description,
          owner: {
            name: data.projects.profiles.name,
            email: data.projects.profiles.email,
          },
        },
        role: data.role,
        expires_at: data.expires_at,
        used_at: data.used_at,
      });
    } catch (err) {
      console.error('Error loading invite:', err);
      setError('Erro ao carregar convite');
    } finally {
      setLoading(false);
    }
  };

  const acceptInvite = async () => {
    if (!user || !invite) return;

    setAccepting(true);
    try {
      // Marcar convite como usado
      const { error: updateError } = await supabase
        .from('project_invites')
        .update({ used_at: new Date().toISOString() })
        .eq('id', invite.id);

      if (updateError) throw updateError;

      // Adicionar usuário ao projeto
      const { error: memberError } = await supabase
        .from('project_members')
        .insert({
          project_id: invite.project.id,
          user_id: user.id,
          role: invite.role as any,
        });

      if (memberError) throw memberError;

      showSuccessToast('Convite aceito com sucesso!');
      navigate('/projects');
    } catch (err) {
      console.error('Error accepting invite:', err);
      showErrorToast('Erro ao aceitar convite');
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-accent/5 flex items-center justify-center">
        <Card className="glass-card max-w-md w-full mx-4">
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2">Carregando convite...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-accent/5 flex items-center justify-center">
        <Card className="glass-card max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <XCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
            <CardTitle className="text-red-400">Convite Inválido</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => navigate('/projects')} variant="outline">
              Ir para Projetos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-accent/5 flex items-center justify-center">
        <Card className="glass-card max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <UserPlus className="w-16 h-16 mx-auto mb-4 text-primary" />
            <CardTitle>Convite para Projeto</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Você precisa fazer login para aceitar este convite.
            </p>
            <Button onClick={() => navigate('/login')} className="glow-button">
              Fazer Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-accent/5 flex items-center justify-center">
      <Card className="glass-card max-w-md w-full mx-4">
        <CardHeader className="text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
          <CardTitle>Convite para Projeto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold">{invite?.project.name}</h3>
            <p className="text-muted-foreground">{invite?.project.description}</p>
          </div>

          <div className="bg-muted/20 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Convidado por:</span>
              <span className="font-medium">{invite?.project.owner.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Função:</span>
              <Badge variant="outline">
                {invite?.role === 'admin' && '🛡️ Admin'}
                {invite?.role === 'member' && '👤 Membro'}
                {invite?.role === 'viewer' && '👁️ Visualizador'}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Expira em:</span>
              <span className="text-sm">
                {invite && new Date(invite.expires_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={acceptInvite} 
              disabled={accepting}
              className="w-full glow-button"
            >
              {accepting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Aceitando...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Aceitar Convite
                </>
              )}
            </Button>
            
            <Button 
              onClick={() => navigate('/projects')} 
              variant="outline"
              className="w-full"
            >
              Recusar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
