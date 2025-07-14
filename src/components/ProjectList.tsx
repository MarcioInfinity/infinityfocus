
import React from 'react';
import { FolderKanban, Plus, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';
import { ProjectRole } from '@/types';
import { ProjectContextMenu } from './ProjectContextMenu';

interface ProjectListProps {
  onSelectProject?: (projectId: string) => void;
  onCreateProject?: () => void;
  selectedProjectId?: string;
  showCreateButton?: boolean;
  maxHeight?: string;
  filter?: 'all' | 'owned' | 'member';
}

export function ProjectList({
  onSelectProject,
  onCreateProject,
  selectedProjectId,
  showCreateButton = true,
  maxHeight = "300px",
  filter = 'all'
}: ProjectListProps) {
  const { user } = useAuth();
  const { projects, isLoading } = useProjects();

  const filteredProjects = projects.filter(project => {
    if (!user) return false;
    
    switch (filter) {
      case 'owned':
        return project.owner_id === user.id;
      case 'member':
        return project.owner_id !== user.id;
      default:
        return true;
    }
  });

  const getUserRole = (project: any): ProjectRole => {
    if (!user) return 'viewer';
    if (project.owner_id === user.id) return 'owner';
    const member = project.members?.find((m: any) => m.user_id === user.id);
    return member?.role || 'viewer';
  };

  const handleProjectClick = (projectId: string) => {
    onSelectProject?.(projectId);
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Carregando projetos...
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {showCreateButton && (
        <Button
          variant="outline"
          className="w-full justify-start neon-border"
          onClick={onCreateProject}
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Projeto
        </Button>
      )}

      <ScrollArea style={{ maxHeight }}>
        <div className="space-y-1">
          {filteredProjects.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              {filter === 'owned' && 'Nenhum projeto próprio'}
              {filter === 'member' && 'Não participa de nenhum projeto'}
              {filter === 'all' && 'Nenhum projeto encontrado'}
            </div>
          ) : (
            filteredProjects.map((project) => {
              const userRole = getUserRole(project);
              const isSelected = selectedProjectId === project.id;
              const completedTasks = project.tasks?.filter((t: any) => t.status === 'done').length || 0;
              const totalTasks = project.tasks?.length || 0;
              const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

              return (
                <ProjectContextMenu
                  key={project.id}
                  projectId={project.id}
                  userRole={userRole}
                  onView={() => handleProjectClick(project.id)}
                >
                  <div
                    className={`
                      p-3 rounded-lg border cursor-pointer transition-all
                      hover:bg-muted/50 hover:border-primary/30
                      ${isSelected ? 'bg-primary/10 border-primary/50' : 'border-border'}
                    `}
                    onClick={() => handleProjectClick(project.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: project.color }}
                        />
                        <span className="font-medium text-sm truncate">
                          {project.name}
                        </span>
                      </div>
                      <Badge 
                        variant="outline" 
                        className="text-xs px-1 py-0"
                      >
                        {userRole === 'owner' && '👑'}
                        {userRole === 'admin' && '🛡️'}
                        {userRole === 'member' && '👤'}
                        {userRole === 'viewer' && '👁️'}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <FolderKanban className="w-3 h-3" />
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{project.members?.length || 0}</span>
                        </div>
                        {project.due_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(project.due_date).toLocaleDateString('pt-BR')}</span>
                          </div>
                        )}
                      </div>

                      {totalTasks > 0 && (
                        <div className="w-full bg-muted rounded-full h-1">
                          <div 
                            className="bg-primary h-1 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </ProjectContextMenu>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
