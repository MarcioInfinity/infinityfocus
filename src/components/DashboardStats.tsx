
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Target, Trophy, TrendingUp, AlertTriangle } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useGoals } from '@/hooks/useGoals';

export function DashboardStats() {
  const { tasks } = useTasks();
  const { projects } = useProjects();
  const { goals } = useGoals();

  // Calculate task statistics
  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'done').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    overdue: tasks.filter(t => 
      t.due_date && 
      new Date(t.due_date) < new Date() && 
      t.status !== 'done'
    ).length,
    highPriority: tasks.filter(t => t.priority === 'high').length
  };

  // Calculate project statistics
  const projectStats = {
    total: projects.length,
    active: projects.filter(p => !p.due_date || new Date(p.due_date) >= new Date()).length,
    shared: projects.filter(p => p.is_shared).length
  };

  // Calculate goal statistics
  const goalStats = {
    total: goals.length,
    completed: goals.filter(g => g.progress === 100).length,
    nearCompletion: goals.filter(g => g.progress >= 80 && g.progress < 100).length,
    averageProgress: goals.length > 0 
      ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
      : 0
  };

  // Productivity metrics
  const completionRate = taskStats.total > 0 
    ? Math.round((taskStats.completed / taskStats.total) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Task Overview */}
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tarefas</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{taskStats.total}</div>
          <div className="space-y-2 mt-4">
            <div className="flex justify-between text-sm">
              <span>Concluídas</span>
              <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                {taskStats.completed}
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>Em progresso</span>
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                {taskStats.inProgress}
              </Badge>
            </div>
            {taskStats.overdue > 0 && (
              <div className="flex justify-between text-sm">
                <span>Atrasadas</span>
                <Badge variant="secondary" className="bg-red-500/20 text-red-400">
                  {taskStats.overdue}
                </Badge>
              </div>
            )}
          </div>
          <Progress value={completionRate} className="mt-3" />
          <p className="text-xs text-muted-foreground mt-2">
            {completionRate}% de conclusão
          </p>
        </CardContent>
      </Card>

      {/* Project Overview */}
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Projetos</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{projectStats.total}</div>
          <div className="space-y-2 mt-4">
            <div className="flex justify-between text-sm">
              <span>Ativos</span>
              <Badge variant="secondary">{projectStats.active}</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>Compartilhados</span>
              <Badge variant="secondary">{projectStats.shared}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals Overview */}
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Metas</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{goalStats.total}</div>
          <div className="space-y-2 mt-4">
            <div className="flex justify-between text-sm">
              <span>Concluídas</span>
              <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                {goalStats.completed}
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>Quase prontas</span>
              <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">
                {goalStats.nearCompletion}
              </Badge>
            </div>
          </div>
          <Progress value={goalStats.averageProgress} className="mt-3" />
          <p className="text-xs text-muted-foreground mt-2">
            {goalStats.averageProgress}% progresso médio
          </p>
        </CardContent>
      </Card>

      {/* Priority Alerts */}
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Alertas</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {taskStats.overdue > 0 && (
              <div className="flex items-center justify-between p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-red-400" />
                  <span className="text-sm">Tarefas atrasadas</span>
                </div>
                <Badge variant="secondary" className="bg-red-500/20 text-red-400">
                  {taskStats.overdue}
                </Badge>
              </div>
            )}
            
            {taskStats.highPriority > 0 && (
              <div className="flex items-center justify-between p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm">Alta prioridade</span>
                </div>
                <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">
                  {taskStats.highPriority}
                </Badge>
              </div>
            )}

            {taskStats.overdue === 0 && taskStats.highPriority === 0 && (
              <div className="flex items-center justify-center p-4 text-center">
                <div className="text-sm text-muted-foreground">
                  🎉 Tudo em dia!
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
