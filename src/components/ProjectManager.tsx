
import { useState } from 'react';
import { Plus, FolderKanban, Users, Calendar, Settings, MoreHorizontal, Eye, Edit, Trash2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ProjectRole } from '@/types';
import { ProjectForm } from './forms/ProjectForm';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';
import { KanbanBoard } from './KanbanBoard';
import { InviteModal } from './modals/InviteModal';

const roleColors = {
  owner: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  admin: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  member: 'bg-green-500/20 text-green-400 border-green-500/30',
  viewer: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
};

export function ProjectManager() {
  const { user } = useAuth();
  const { projects, createProject, updateProject, deleteProject, isLoading } = useProjects();
  const [filter, setFilter] = useState<'all' | 'owned' | 'member'>('all');
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isKanbanOpen, setIsKanbanOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteProjectId, setInviteProjectId] = useState<string>('');

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

  const getProjectProgress = (project: any) => {
    if (!project.tasks || project.tasks.length === 0) return 0;
    const completedTasks = project.tasks.filter((task: any) => task.status === 'done').length;
    return (completedTasks / project.tasks.length) * 100;
  };

  const getUserRole = (project: any): ProjectRole => {
    if (!user) return 'viewer';
    if (project.owner_id === user.id) return 'owner';
    const member = project.members?.find((m: any) => m.user_id === user.id);
    return member?.role || 'viewer';
  };

  const handleCreateProject = (projectData: any) => {
    createProject(projectData);
    setIsProjectFormOpen(false);
  };

  const handleDeleteProject = (projectId: string) => {
    if (confirm('Tem certeza que deseja excluir este projeto?')) {
      deleteProject(projectId);
    }
  };

  const handleOpenKanban = (project: any) => {
    setSelectedProject(project);
    setIsKanbanOpen(true);
  };

  const handleOpenInvite = (projectId: string) => {
    setInviteProjectId(projectId);
    setIsInviteModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Projetos
            </h1>
            <p className="text-muted-foreground mt-1">
              Carregando projetos...
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="project-card animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-muted rounded w-full mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Projetos
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie projetos colaborativos e equipes
          </p>
        </div>
        <Dialog open={isProjectFormOpen} onOpenChange={setIsProjectFormOpen}>
          <DialogTrigger asChild>
            <Button className="glow-button">
              <Plus className="w-4 h-4 mr-2" />
              Novo Projeto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <ProjectForm 
              onSubmit={handleCreateProject} 
              onCancel={() => setIsProjectFormOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'owned', 'member'] as const).map(filterOption => (
          <Button
            key={filterOption}
            variant={filter === filterOption ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(filterOption)}
            className={filter === filterOption ? 'glow-button' : 'neon-border'}
          >
            {filterOption === 'all' && 'Todos'}
            {filterOption === 'owned' && 'Meus Projetos'}
            {filterOption === 'member' && 'Participando'}
          </Button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="space-y-4">
        {filteredProjects.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="text-center py-12">
              <FolderKanban className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">
                {projects.length === 0 ? 'Nenhum projeto encontrado' : 'Nenhum projeto corresponde ao filtro'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {projects.length === 0 ? 'Crie seu primeiro projeto para colaborar com sua equipe' : 'Tente ajustar os filtros ou criar um novo projeto'}
              </p>
              <Dialog open={isProjectFormOpen} onOpenChange={setIsProjectFormOpen}>
                <DialogTrigger asChild>
                  <Button className="glow-button">
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeiro Projeto
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <ProjectForm 
                    onSubmit={handleCreateProject} 
                    onCancel={() => setIsProjectFormOpen(false)} 
                  />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map(project => {
              const progress = getProjectProgress(project);
              const userRole = getUserRole(project);
              const completedTasks = project.tasks?.filter((t: any) => t.status === 'done').length || 0;
              const totalTasks = project.tasks?.length || 0;

              return (
                <Card key={project.id} className="project-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: project.color }}
                        />
                        <div className="min-w-0">
                          <CardTitle className="text-lg truncate">{project.name}</CardTitle>
                          {project.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {project.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="glass-card border-white/20">
                          <DropdownMenuItem onClick={() => handleOpenKanban(project)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Visualizar
                          </DropdownMenuItem>
                          {(userRole === 'owner' || userRole === 'admin') && (
                            <>
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleOpenInvite(project.id)}>
                                <UserPlus className="w-4 h-4 mr-2" />
                                Convidar Membros
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Settings className="w-4 h-4 mr-2" />
                                Configurações
                              </DropdownMenuItem>
                            </>
                          )}
                          {userRole === 'owner' && (
                            <DropdownMenuItem 
                              className="text-red-400"
                              onClick={() => handleDeleteProject(project.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Role Badge */}
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className={roleColors[userRole]}>
                        {userRole === 'owner' && '👑 Proprietário'}
                        {userRole === 'admin' && '🛡️ Admin'}
                        {userRole === 'member' && '👤 Membro'}
                        {userRole === 'viewer' && '👁️ Visualizador'}
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        {completedTasks}/{totalTasks} tarefas
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-medium">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    {/* Members */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {project.members?.length || 0} membro{(project.members?.length || 0) !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex -space-x-2">
                        {project.members?.slice(0, 4).map((member: any) => (
                          <Avatar key={member.id} className="w-8 h-8 border-2 border-background">
                            <AvatarImage src={member.user?.avatar} />
                            <AvatarFallback className="text-xs bg-primary/20">
                              {member.user?.name?.charAt(0).toUpperCase() || '?'}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {(project.members?.length || 0) > 4 && (
                          <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                            <span className="text-xs font-medium">
                              +{(project.members?.length || 0) - 4}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        className="flex-1 glow-button" 
                        size="sm"
                        onClick={() => handleOpenKanban(project)}
                      >
                        <FolderKanban className="w-4 h-4 mr-2" />
                        Abrir Quadro
                      </Button>
                      {(userRole === 'owner' || userRole === 'admin') && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="neon-border"
                          onClick={() => handleOpenInvite(project.id)}
                        >
                          <UserPlus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    {/* Created Date */}
                    <div className="text-xs text-muted-foreground pt-2 border-t border-white/10">
                      Criado em {new Date(project.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <Dialog open={isProjectFormOpen} onOpenChange={setIsProjectFormOpen}>
        <DialogTrigger asChild>
          <Button className="floating-action animate-pulse-glow">
            <Plus className="w-6 h-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <ProjectForm 
            onSubmit={handleCreateProject} 
            onCancel={() => setIsProjectFormOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      {/* Kanban Board Modal */}
      <Dialog open={isKanbanOpen} onOpenChange={setIsKanbanOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
          {selectedProject && (
            <KanbanBoard 
              projectId={selectedProject.id}
              projectName={selectedProject.name}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Invite Modal */}
      <InviteModal
        projectId={inviteProjectId}
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </div>
  );
}
