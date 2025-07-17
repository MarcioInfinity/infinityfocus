
import { useState } from 'react';
import { Plus, Filter, Search, Calendar, Users, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { ProjectForm } from './forms/ProjectForm';
import { EditProjectModal } from './modals/EditProjectModal';
import { useProjects } from '@/hooks/useProjects';
import { Project } from '@/types';

export function ProjectManager() {
  const { projects, createProject, updateProject, deleteProject } = useProjects();
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const handleCreateProject = (projectData: any) => {
    createProject(projectData);
    setIsProjectFormOpen(false);
  };

  const handleUpdateProject = (projectData: any) => {
    if (editingProject) {
      updateProject({ id: editingProject.id, updates: projectData });
      setEditingProject(null);
    }
  };

  const handleDeleteProject = (projectId: string) => {
    deleteProject(projectId);
  };

  // Filter projects based on search term and filters
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (project.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || project.category === categoryFilter;
    
    return matchesSearch && matchesPriority && matchesCategory;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500/50 text-red-400';
      case 'medium': return 'border-yellow-500/50 text-yellow-400';
      case 'low': return 'border-green-500/50 text-green-400';
      default: return 'border-gray-500/50 text-gray-400';
    }
  };

  const getCategoryText = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'professional': 'Profissional',
      'intellectual': 'Intelectual',
      'finance': 'Financeiro',
      'social': 'Social',
      'relationship': 'Relacionamento',
      'family': 'Família',
      'leisure': 'Lazer',
      'health': 'Saúde',
      'spiritual': 'Espiritual',
      'emotional': 'Emocional',
      'other': 'Outro'
    };
    return categoryMap[category] || category;
  };

  const calculateProgress = (project: Project) => {
    if (!project.tasks || project.tasks.length === 0) return 0;
    const completedTasks = project.tasks.filter(task => task.status === 'done').length;
    return Math.round((completedTasks / project.tasks.length) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Gerenciar Projetos
          </h1>
          <p className="text-muted-foreground mt-1">
            Organize e acompanhe todos os seus projetos
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
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar projetos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Prioridades</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                <SelectItem value="professional">Profissional</SelectItem>
                <SelectItem value="intellectual">Intelectual</SelectItem>
                <SelectItem value="finance">Financeiro</SelectItem>
                <SelectItem value="social">Social</SelectItem>
                <SelectItem value="relationship">Relacionamento</SelectItem>
                <SelectItem value="family">Família</SelectItem>
                <SelectItem value="leisure">Lazer</SelectItem>
                <SelectItem value="health">Saúde</SelectItem>
                <SelectItem value="spiritual">Espiritual</SelectItem>
                <SelectItem value="emotional">Emocional</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full">
            <Card className="glass-card">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="w-12 h-12 text-muted-foreground opacity-50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum projeto encontrado</h3>
                <p className="text-muted-foreground text-center">
                  {searchTerm || priorityFilter !== 'all' || categoryFilter !== 'all' 
                    ? 'Tente ajustar os filtros de busca'
                    : 'Comece criando seu primeiro projeto!'
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredProjects.map(project => (
            <Card key={project.id} className="glass-card hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: project.color }}
                    />
                    <CardTitle className="text-lg truncate">{project.name}</CardTitle>
                  </div>
                </div>
                {project.description && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {project.description}
                  </p>
                )}
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progresso</span>
                    <span>{calculateProgress(project)}%</span>
                  </div>
                  <Progress value={calculateProgress(project)} className="h-2" />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <p className="font-semibold text-primary">{project.tasks?.length || 0}</p>
                    <p className="text-muted-foreground">Tarefas</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-accent">{project.members?.length || 0}</p>
                    <p className="text-muted-foreground">Membros</p>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className={getPriorityColor(project.priority)}>
                    {project.priority === 'high' ? 'Alta' : project.priority === 'medium' ? 'Média' : 'Baixa'}
                  </Badge>
                  
                  <Badge variant="secondary">
                    {getCategoryText(project.category)}
                  </Badge>
                  
                  {project.due_date && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(project.due_date)}
                    </Badge>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingProject(project)}
                    className="flex-1"
                  >
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteProject(project.id)}
                    className="flex-1"
                  >
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Project Modal */}
      {editingProject && (
        <EditProjectModal
          project={editingProject}
          onSave={handleUpdateProject}
          onClose={() => setEditingProject(null)}
        />
      )}
    </div>
  );
}
