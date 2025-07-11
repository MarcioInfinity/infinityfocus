
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link, Mail, Copy, Send, Plus, X } from 'lucide-react';
import { useToastNotifications } from '@/hooks/use-toast-notifications';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  projectId: string;
}

export function InviteModal({ isOpen, onClose, projectName, projectId }: InviteModalProps) {
  const [emails, setEmails] = useState(['']);
  const [message, setMessage] = useState(`Você foi convidado para colaborar no projeto "${projectName}" no Infinity Focus!`);
  const { showSuccessToast, showInfoToast } = useToastNotifications();

  const inviteLink = `${window.location.origin}/project/invite/${projectId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    showSuccessToast('Link copiado!', 'O link de convite foi copiado para a área de transferência');
  };

  const handleSendEmails = () => {
    const validEmails = emails.filter(email => email.trim() && email.includes('@'));
    if (validEmails.length === 0) {
      showInfoToast('Nenhum email válido', 'Adicione pelo menos um email válido para enviar convites');
      return;
    }

    // Aqui seria integrado com o Supabase para enviar emails
    showSuccessToast('Convites enviados!', `${validEmails.length} convite(s) enviado(s) com sucesso`);
    setEmails(['']);
    onClose();
  };

  const addEmailField = () => {
    setEmails([...emails, '']);
  };

  const removeEmailField = (index: number) => {
    setEmails(emails.filter((_, i) => i !== index));
  };

  const updateEmail = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl glass-card">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Convidar Membros
          </DialogTitle>
          <p className="text-muted-foreground">
            Convide pessoas para colaborar no projeto "{projectName}"
          </p>
        </DialogHeader>

        <Tabs defaultValue="link" className="w-full">
          <TabsList className="grid w-full grid-cols-2 glass-card">
            <TabsTrigger value="link" className="flex items-center gap-2">
              <Link className="w-4 h-4" />
              Link de Convite
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Convite por Email
            </TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-4">
            <div className="glass-card p-4 space-y-4">
              <Label>Link do Projeto</Label>
              <div className="flex gap-2">
                <Input
                  value={inviteLink}
                  readOnly
                  className="neon-border font-mono text-sm"
                />
                <Button onClick={handleCopyLink} className="glow-button">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Compartilhe este link com as pessoas que você deseja convidar. 
                Elas poderão acessar o projeto através deste link.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Emails dos Convidados</Label>
                {emails.map((email, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="email@exemplo.com"
                      value={email}
                      onChange={(e) => updateEmail(index, e.target.value)}
                      className="neon-border"
                    />
                    {emails.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeEmailField(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addEmailField}
                  className="neon-border"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Email
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Mensagem do Convite</Label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full min-h-[100px] p-3 rounded-md border neon-border bg-background resize-none"
                  placeholder="Personalize a mensagem do convite..."
                />
              </div>

              <Button onClick={handleSendEmails} className="w-full glow-button">
                <Send className="w-4 h-4 mr-2" />
                Enviar Convites
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1 neon-border">
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
