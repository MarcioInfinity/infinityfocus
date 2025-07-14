
import React from 'react';
import { 
  Eye, 
  Edit, 
  UserPlus, 
  Settings, 
  Trash2, 
  FolderKanban,
  Share,
  Copy,
  Archive
} from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { ProjectRole } from '@/types';

interface ProjectContextMenuProps {
  children: React.ReactNode;
  projectId: string;
  userRole: ProjectRole;
  onView?: () => void;
  onEdit?: () => void;
  onInvite?: () => void;
  onSettings?: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
  onCopyLink?: () => void;
  onShare?: () => void;
}

export function ProjectContextMenu({
  children,
  projectId,
  userRole,
  onView,
  onEdit,
  onInvite,
  onSettings,
  onDelete,
  onArchive,
  onCopyLink,
  onShare
}: ProjectContextMenuProps) {
  const canEdit = userRole === 'owner' || userRole === 'admin';
  const canDelete = userRole === 'owner';
  const canInvite = userRole === 'owner' || userRole === 'admin';

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="glass-card border-white/20">
        <ContextMenuItem onClick={onView}>
          <Eye className="w-4 h-4 mr-2" />
          Visualizar Projeto
        </ContextMenuItem>
        
        <ContextMenuItem onClick={() => onView?.()}>
          <FolderKanban className="w-4 h-4 mr-2" />
          Abrir Quadro Kanban
        </ContextMenuItem>

        {canEdit && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Editar Projeto
            </ContextMenuItem>
          </>
        )}

        {canInvite && (
          <ContextMenuItem onClick={onInvite}>
            <UserPlus className="w-4 h-4 mr-2" />
            Convidar Membros
          </ContextMenuItem>
        )}

        <ContextMenuSeparator />
        
        <ContextMenuItem onClick={onShare}>
          <Share className="w-4 h-4 mr-2" />
          Compartilhar
        </ContextMenuItem>

        <ContextMenuItem onClick={onCopyLink}>
          <Copy className="w-4 h-4 mr-2" />
          Copiar Link
        </ContextMenuItem>

        {canEdit && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={onSettings}>
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </ContextMenuItem>

            <ContextMenuItem onClick={onArchive}>
              <Archive className="w-4 h-4 mr-2" />
              Arquivar Projeto
            </ContextMenuItem>
          </>
        )}

        {canDelete && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem 
              className="text-red-400 focus:text-red-300"
              onClick={onDelete}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir Projeto
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
