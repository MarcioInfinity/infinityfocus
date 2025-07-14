
import React from 'react';
import { FolderKanban, Users, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';

export function ProjectStats() {
  const { user } = useAuth();
  const { projects, isLoading } = useProjects();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalProjects = projects.length;
  const ownedProjects = projects.filter(p => p.owner_id === user?.id).length;
  const memberProjects = projects.filter(p => p.owner_id !== user?.id).length;

  const allTasks = projects.flatMap(p => p.tasks || []);
  const completedTasks = allTasks.filter(t => t.status === 'done').length;
  const overdueTasks = allTasks.filter(t => 
    t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done'
  ).length;

  const totalMembers = projects.reduce((acc, p) => acc + (p.members?.length || 0), 0);

  const stats = [
    {
      title: 'Total de Projetos',
      value: totalProjects,
      icon: FolderKanban,
      description: `${ownedProjects} próprios, ${memberProjects} participando`,
      trend: totalProjects > 0 ? 'positive' : 'neutral'
    },
    {
      title: 'Membros da Equipe',
      value: totalMembers,
      icon: Users,
      description: 'Colaboradores ativos',
      trend: totalMembers > 0 ? 'positive' : 'neutral'
    },
    {
      title: 'Tarefas Concluídas',
      value: completedTasks,
      icon: CheckCircle,
      description: `${allTasks.length} tarefas no total`,
      trend: completedTasks > 0 ? 'positive' : 'neutral'
    },
    {
      title: 'Tarefas Atrasadas',
      value: overdueTasks,
      icon: AlertTriangle,
      description: 'Requer atenção',
      trend: overdueTasks > 0 ? 'negative' : 'positive'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        
        return (
          <Card key={stat.title} className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">
                  {stat.value}
                </div>
                <Badge 
                  variant={stat.trend === 'positive' ? 'default' : 
                          stat.trend === 'negative' ? 'destructive' : 'secondary'}
                  className="ml-2"
                >
                  {stat.trend === 'positive' && '↗️'}
                  {stat.trend === 'negative' && '⚠️'}
                  {stat.trend === 'neutral' && '➖'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
