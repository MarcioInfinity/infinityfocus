
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, UserPlus, Mail, Link } from 'lucide-react';
import { useToastNotifications } from '@/hooks/use-toast-notifications';
import { useProjectInvites } from '@/hooks/useProjectInvites';
import { ProjectRole } from '@/types';

interface InviteModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function InviteModal({ projectId, isOpen, onClose }: InviteModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<ProjectRole>('member');
  const [inviteLink, setInviteLink] = useState('');
  const { showSuccessToast, showErrorToast } = useToastNotifications();
  const { createInviteAsync, isCreatingInvite } = useProjectInvites();

  const generateInviteLink = async () => {
    try {
      const result = await createInviteAsync({ 
        projectId, 
        role 
      });
      
      const link = `${window.location.origin}/invite/${result.token}`;
      setInviteLink(link);
      showSuccessToast('Link de convite gerado!');
    } catch (error) {
      showErrorToast('Erro ao gerar link de convite');
    }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    showSuccessToast('Link copiado para a área de transferência!');
  };

  const sendEmailInvite = async () => {
    if (!email) {
      showErrorToast('Digite um email válido');
      return;
    }

    try {
      await createInviteAsync({ 
        projectId, 
        email, 
        role 
      });
      
      showSuccessToast(`Convite enviado para ${email}`);
      setEmail('');
    } catch (error) {
      showErrorToast('Erro ao enviar convite');
    }
  };

  const handleClose = () => {
    setEmail('');
    setInviteLink('');
    setRole('member');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass-card max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Convidar Membros
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Email Invite */}
          <div className="space-y-4">
            <h3 className="font-medium">Convidar por Email</h3>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@exemplo.com"
                className="neon-border"
              />
            </div>

            <div className="space-y-2">
              <Label>Função</Label>
              <Select value={role} onValueChange={(value: ProjectRole) => setRole(value)}>
                <SelectTrigger className="glass-card border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/20">
                  <SelectItem value="viewer">👁️ Visualizador</SelectItem>
                  <SelectItem value="member">👤 Membro</SelectItem>
                  <SelectItem value="admin">🛡️ Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={sendEmailInvite} 
              disabled={isCreatingInvite}
              className="w-full glow-button"
            >
              <Mail className="w-4 h-4 mr-2" />
              {isCreatingInvite ? 'Enviando...' : 'Enviar Convite'}
            </Button>
          </div>

          <div className="border-t border-white/10 pt-6">
            <h3 className="font-medium mb-4">Link de Convite</h3>
            
            {!inviteLink ? (
              <Button 
                onClick={generateInviteLink}
                disabled={isCreatingInvite}
                variant="outline" 
                className="w-full neon-border"
              >
                <Link className="w-4 h-4 mr-2" />
                {isCreatingInvite ? 'Gerando...' : 'Gerar Link de Convite'}
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={inviteLink}
                    readOnly
                    className="bg-muted/50 font-mono text-xs"
                  />
                  <Button onClick={copyInviteLink} variant="outline" size="sm">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Este link permite que qualquer pessoa entre no projeto como {role}. 
                  O convite expira em 7 dias.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
