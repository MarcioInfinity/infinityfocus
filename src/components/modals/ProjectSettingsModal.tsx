
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Users, Crown, Shield, Eye, Trash2, UserMinus } from 'lucide-react';
import { useProjectInvites } from '@/hooks/useProjectInvites';
import { useProjects } from '@/hooks/useProjects';
import { useToastNotifications } from '@/hooks/use-toast-notifications';

interface ProjectSettingsModalProps {
  project: any;
  isOpen: boolean;
  onClose: () => void;
}

const roleIcons = {
  owner: Crown,
  admin: Shield,
  member: Users,
  viewer: Eye
};

const roleColors = {
  owner: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  admin: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  member: 'bg-green-500/20 text-green-400 border-green-500/30',
  viewer: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
};

export function ProjectSettingsModal({ project, isOpen, onClose }: ProjectSettingsModalProps) {
  const { updateProject, deleteProject, isUpdating, isDeleting } = useProjects();
  const { getProjectInvites } = useProjectInvites();
  const { showSuccessToast, showErrorToast } = useToastNotifications();
  
  const [settings, setSettings] = useState({
    notifications_enabled: false,
    is_shared: false,
    repeat_enabled: false,
  });

  const invitesQuery = getProjectInvites(project?.id);

  useEffect(() => {
    if (project && isOpen) {
      setSettings({
        notifications_enabled: project.notifications_enabled || false,
        is_shared: project.is_shared || false,
        repeat_enabled: project.repeat_enabled || false,
      });
    }
  }, [project, isOpen]);

  const handleUpdateSettings = async () => {
    try {
      updateProject({ id: project.id, updates: settings });
    } catch (error) {
      console.error('Error updating project settings:', error);
      showErrorToast('Erro ao atualizar configurações');
    }
  };

  const handleDeleteProject = async () => {
    if (confirm('Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.')) {
      try {
        deleteProject(project.id);
        onClose();
      } catch (error) {
        console.error('Error deleting project:', error);
        showErrorToast('Erro ao excluir projeto');
      }
    }
  };

  const handleChangeMemberRole = async (memberId: string, newRole: string) => {
    // TODO: Implement member role change functionality
    showSuccessToast(`Papel do membro alterado para ${newRole}`);
  };

  const handleRemoveMember = async (memberId: string) => {
    if (confirm('Tem certeza que deseja remover este membro do projeto?')) {
      // TODO: Implement remove member functionality
      showSuccessToast('Membro removido do projeto');
    }
  };

  if (!project) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: project.color }}
            />
            Configurações - {project.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Configurações Gerais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Configurações Gerais</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-white/10">
                <div>
                  <Label className="text-sm font-medium">Notificações</Label>
                  <p className="text-xs text-muted-foreground">Receber notificações do projeto</p>
                </div>
                <Switch
                  checked={settings.notifications_enabled}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, notifications_enabled: checked }))}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border border-white/10">
                <div>
                  <Label className="text-sm font-medium">Projeto Compartilhado</Label>
                  <p className="text-xs text-muted-foreground">Permitir colaboração</p>
                </div>
                <Switch
                  checked={settings.is_shared}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, is_shared: checked }))}
                />
              </div>
            </div>

            <Button onClick={handleUpdateSettings} disabled={isUpdating} className="glow-button">
              {isUpdating ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </div>

          <Separator />

          {/* Membros do Projeto */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5" />
              Membros do Projeto
            </h3>
            
            {project.members && project.members.length > 0 ? (
              <div className="space-y-3">
                {project.members.map((member: any) => {
                  const RoleIcon = roleIcons[member.role as keyof typeof roleIcons];
                  return (
                    <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border border-white/10">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={member.user?.avatar} />
                          <AvatarFallback className="text-xs bg-primary/20">
                            {member.user?.name?.charAt(0).toUpperCase() || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.user?.name || 'Usuário'}</p>
                          <p className="text-sm text-muted-foreground">{member.user?.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={roleColors[member.role as keyof typeof roleColors]}>
                          <RoleIcon className="w-3 h-3 mr-1" />
                          {member.role === 'owner' && 'Proprietário'}
                          {member.role === 'admin' && 'Admin'}
                          {member.role === 'member' && 'Membro'}
                          {member.role === 'viewer' && 'Visualizador'}
                        </Badge>
                        
                        {member.role !== 'owner' && (
                          <div className="flex gap-1">
                            <Select value={member.role} onValueChange={(value) => handleChangeMemberRole(member.id, value)}>
                              <SelectTrigger className="w-32 h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="member">Membro</SelectItem>
                                <SelectItem value="viewer">Visualizador</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveMember(member.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <UserMinus className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">Nenhum membro adicionado ainda</p>
            )}
          </div>

          <Separator />

          {/* Convites Pendentes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Convites Pendentes</h3>
            
            {invitesQuery.data && invitesQuery.data.length > 0 ? (
              <div className="space-y-2">
                {invitesQuery.data.filter((invite: any) => !invite.used_at).map((invite: any) => (
                  <div key={invite.id} className="flex items-center justify-between p-3 rounded-lg border border-white/10">
                    <div>
                      <p className="font-medium">{invite.email || 'Link de convite'}</p>
                      <p className="text-sm text-muted-foreground">
                        Papel: {invite.role} • Expira em: {new Date(invite.expires_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-yellow-400 border-yellow-400/30">
                      Pendente
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">Nenhum convite pendente</p>
            )}
          </div>

          <Separator />

          {/* Zona de Perigo */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-red-400">Zona de Perigo</h3>
            
            <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-red-400">Excluir Projeto</h4>
                  <p className="text-sm text-muted-foreground">
                    Esta ação é permanente e não pode ser desfeita
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={handleDeleteProject}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isDeleting ? 'Excluindo...' : 'Excluir Projeto'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
