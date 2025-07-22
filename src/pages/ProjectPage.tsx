import { useParams } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { KanbanBoard } from '@/components/KanbanBoard';
import { ProjectGoals } from '@/components/ProjectGoals';
import { useProjects } from '@/hooks/useProjects';
import { Card, CardContent } from '@/components/ui/card';
import { FolderKanban, Flag } from 'lucide-react';

export function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { projects, isLoading } = useProjects();
  
  const project = projects.find(p => p.id === projectId);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-8 bg-muted rounded w-1/3 animate-pulse"></div>
        <div className="h-96 bg-muted rounded animate-pulse"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <Card className="glass-card">
        <CardContent className="text-center py-12">
          <FolderKanban className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Projeto não encontrado</h3>
          <p className="text-muted-foreground">O projeto que você está procurando não existe ou foi removido.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div 
          className="w-6 h-6 rounded-full flex-shrink-0" 
          style={{ backgroundColor: project.color }}
        />
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {project.name}
        </h1>
      </div>

      <Tabs defaultValue="kanban" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="kanban" className="flex items-center gap-2">
            <FolderKanban className="w-4 h-4" />
            Kanban
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <Flag className="w-4 h-4" />
            Metas
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="kanban" className="mt-6">
          <KanbanBoard projectId={projectId!} />
        </TabsContent>
        
        <TabsContent value="goals" className="mt-6">
          <ProjectGoals projectId={projectId!} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
