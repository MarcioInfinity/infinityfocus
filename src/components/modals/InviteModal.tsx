
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Mail, Share2, X } from 'lucide-react';
import { useProjectInvites } from '@/hooks/useProjectInvites';
import { useToastNotifications } from '@/hooks/use-toast-notifications';

interface InviteModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function InviteModal({ projectId, isOpen, onClose }: InviteModalProps) {
  const { createInviteAsync, isCreatingInvite, getProjectInvites } = useProjectInvites();
  const { showSuccessToast } = useToastNotifications();
  const invitesQuery = getProjectInvites(projectId);
  const invites = invitesQuery.data || [];

  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [generatedLink, setGeneratedLink] = useState<string>('');
  const [showLinkOnly, setShowLinkOnly] = useState(false);

  const handleCreateInvite = async () => {
    try {
      const result = await createInviteAsync({
        projectId,
        email: showLinkOnly ? undefined : email,
        role,
      });

      if (result?.inviteLink) {
        setGeneratedLink(result.inviteLink);
      }

      if (!showLinkOnly) {
        setEmail('');
      }
    } catch (error) {
      console.error('Error creating invite:', error);
    }
  };

  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      showSuccessToast('Link copiado para a área de transferência!');
    }
  };

  const handleReset = () => {
    setEmail('');
    setRole('member');
    setGeneratedLink('');
    setShowLinkOnly(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass-card max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Convidar Membros para o Projeto
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Formulário de Convite */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                variant={showLinkOnly ? "outline" : "default"}
                onClick={() => setShowLinkOnly(false)}
                className="flex-1"
              >
                <Mail className="w-4 h-4 mr-2" />
                Enviar por Email
              </Button>
              <Button
                variant={showLinkOnly ? "default" : "outline"}
                onClick={() => setShowLinkOnly(true)}
                className="flex-1"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Gerar Link apenas
              </Button>
            </div>

            {!showLinkOnly && (
              <div className="space-y-2">
                <Label htmlFor="email">Email do Convidado</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Digite o email da pessoa..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-card border-white/20"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="role">Função no Projeto</Label>
              <Select value={role} onValueChange={(value: 'admin' | 'member' | 'viewer') => setRole(value)}>
                <SelectTrigger className="glass-card border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/20">
                  <SelectItem value="viewer">👁️ Visualizador - Pode apenas visualizar</SelectItem>
                  <SelectItem value="member">👤 Membro - Pode editar tarefas</SelectItem>
                  <SelectItem value="admin">🛡️ Admin - Pode gerenciar projeto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleCreateInvite}
              disabled={isCreatingInvite || (!showLinkOnly && !email.trim())}
              className="w-full glow-button"
            >
              {isCreatingInvite ? 'Criando convite...' : showLinkOnly ? 'Gerar Link de Convite' : 'Enviar Convite'}
            </Button>
          </div>

          {/* Link Gerado */}
          {generatedLink && (
            <div className="space-y-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
              <Label>Link de Convite Gerado</Label>
              <div className="flex gap-2">
                <Textarea
                  value={generatedLink}
                  readOnly
                  className="glass-card border-white/20 resize-none"
                  rows={2}
                />
                <Button onClick={handleCopyLink} size="sm" className="shrink-0">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Este link expira em 7 dias. Compartilhe-o com as pessoas que você quer convidar.
              </p>
            </div>
          )}

          {/* Lista de Convites Pendentes */}
          {invites.length > 0 && (
            <div className="space-y-3">
              <Label>Convites Pendentes</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {invites
                  .filter(invite => !invite.used_at && new Date(invite.expires_at) > new Date())
                  .map(invite => (
                    <div
                      key={invite.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-white/10"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">
                          {invite.email || 'Link de convite'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Função: {invite.role === 'admin' ? '🛡️ Admin' : invite.role === 'member' ? '👤 Membro' : '👁️ Visualizador'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Expira em: {new Date(invite.expires_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const link = `${window.location.origin}/invite/${invite.token}`;
                          navigator.clipboard.writeText(link);
                          showSuccessToast('Link copiado!');
                        }}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={handleClose} className="flex-1 neon-border">
            Fechar
          </Button>
          <Button onClick={handleReset} variant="outline" className="neon-border">
            Limpar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
