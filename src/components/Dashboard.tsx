
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, CheckSquare, Target, FolderOpen, Plus, Clock, AlertTriangle } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useGoals } from '@/hooks/useGoals';
import { format, isToday, isPast, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function Dashboard() {
  const { tasks } = useTasks();
  const { projects } = useProjects();
  const { goals } = useGoals();

  // Função para filtrar tarefas do dia
  const getTodayTasks = () => {
    const today = new Date();
    
    return tasks.filter((task) => {
      // Tarefas atrasadas
      if (task.due_date && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date))) {
        return true;
      }
      
      // Tarefas com vencimento hoje
      if (task.due_date && isToday(new Date(task.due_date))) {
        return true;
      }
      
      // Tarefas que se repetem
      if (task.repeat_enabled && task.repeat_type) {
        const taskDate = task.start_date ? new Date(task.start_date) : new Date(task.created_at);
        
        switch (task.repeat_type) {
          case 'daily':
            return true; // Tarefas diárias aparecem todos os dias
            
          case 'weekly':
            if (task.repeat_days && task.repeat_days.length > 0) {
              const todayDay = today.getDay().toString();
              return task.repeat_days.includes(todayDay);
            }
            break;
            
          case 'monthly':
            if (task.monthly_day) {
              return today.getDate() === task.monthly_day;
            }
            break;
            
          case 'custom':
            if (task.custom_dates && task.custom_dates.length > 0) {
              return task.custom_dates.some((customDate) => 
                isToday(new Date(customDate))
              );
            }
            break;
        }
      }
      
      return false;
    });
  };

  const todayTasks = getTodayTasks();
  const overdueTasks = tasks.filter(task => 
    task.due_date && 
    isPast(new Date(task.due_date)) && 
    !isToday(new Date(task.due_date)) &&
    task.status !== 'done'
  );

  const completedTasks = tasks.filter(task => task.status === 'done');
  const activeTasks = tasks.filter(task => task.status !== 'done');
  const activeGoals = goals.filter(goal => goal.progress < 100);
  const completedGoals = goals.filter(goal => goal.progress >= 100);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'professional': return '💼';
      case 'intellectual': return '🧠';
      case 'finance': return '💰';
      case 'social': return '👥';
      case 'relationship': return '❤️';
      case 'family': return '👨‍👩‍👧‍👦';
      case 'leisure': return '🎮';
      case 'health': return '🏥';
      case 'spiritual': return '🙏';
      case 'emotional': return '😊';
      default: return '📋';
    }
  };

  const getTaskTypeLabel = (task: any) => {
    if (task.due_date && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date))) {
      return { label: 'Atrasada', color: 'bg-red-500' };
    }
    if (task.due_date && isToday(new Date(task.due_date))) {
      return { label: 'Vence hoje', color: 'bg-orange-500' };
    }
    if (task.repeat_enabled) {
      return { label: 'Repetição', color: 'bg-blue-500' };
    }
    return { label: 'Normal', color: 'bg-gray-500' };
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Bem-vindo de volta! Aqui está um resumo das suas atividades.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card hover:scale-105 transition-transform">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas Ativas</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{activeTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              {completedTasks.length} concluídas
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card hover:scale-105 transition-transform">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{projects.length}</div>
            <p className="text-xs text-muted-foreground">
              Total de projetos
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card hover:scale-105 transition-transform">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Metas Ativas</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{activeGoals.length}</div>
            <p className="text-xs text-muted-foreground">
              {completedGoals.length} concluídas
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card hover:scale-105 transition-transform">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{todayTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              Para hoje
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tarefas do Dia */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Tarefas do Dia
              </CardTitle>
              {overdueTasks.length > 0 && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {overdueTasks.length} atrasadas
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {todayTasks.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Nenhuma tarefa para hoje</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {todayTasks.slice(0, 10).map((task) => {
                  const typeInfo = getTaskTypeLabel(task);
                  return (
                    <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-lg">{getCategoryIcon(task.category)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{task.title}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="outline" className={`${typeInfo.color} text-white border-none text-xs px-2 py-0`}>
                              {typeInfo.label}
                            </Badge>
                            {task.due_date && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(new Date(task.due_date), 'dd/MM', { locale: ptBR })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority).replace('text-', 'bg-')}`} />
                    </div>
                  );
                })}
                {todayTasks.length > 10 && (
                  <p className="text-center text-sm text-muted-foreground">
                    +{todayTasks.length - 10} mais tarefas...
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progresso das Metas */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Progresso das Metas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeGoals.length === 0 ? (
              <div className="text-center py-8">
                <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-4">Nenhuma meta ativa</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {activeGoals.slice(0, 5).map((goal) => (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{getCategoryIcon(goal.category)}</span>
                        <span className="font-medium text-sm truncate">{goal.name}</span>
                      </div>
                      <span className="text-sm font-medium">{Math.round(goal.progress)}%</span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                  </div>
                ))}
                {activeGoals.length > 5 && (
                  <p className="text-center text-sm text-muted-foreground">
                    +{activeGoals.length - 5} mais metas...
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Projetos Recentes */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Projetos Recentes
            </CardTitle>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Novo Projeto
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-8">
              <FolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground mb-4">Nenhum projeto criado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.slice(0, 6).map((project) => (
                <Card key={project.id} className="glass-card hover:scale-105 transition-transform">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: project.color }}
                      />
                      <CardTitle className="text-sm font-medium truncate">{project.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {project.description || 'Sem descrição'}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {getCategoryIcon(project.category)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {project.tasks?.length || 0} tarefas
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
