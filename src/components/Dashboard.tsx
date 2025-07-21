
import { useState } from 'react';
import { Plus, CheckCircle, Target, FolderKanban, Clock, Calendar, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { TaskForm } from './forms/TaskForm';
import { ProjectForm } from './forms/ProjectForm';
import { GoalForm } from './forms/GoalForm';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useGoals } from '@/hooks/useGoals';
import { useAuth } from '@/hooks/useAuth';
import { useTodayTasks } from '@/hooks/useTodayTasks';
import { DateTimeDisplay } from './DateTimeDisplay';

export function Dashboard() {
  const { user } = useAuth();
  const { tasks, createTask, updateTask } = useTasks();
  const { projects, createProject } = useProjects();
  const { goals, createGoal } = useGoals();
  const { todayTasks } = useTodayTasks();

  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);

  // Estatísticas
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'done').length;
  const overdueTasks = tasks.filter(task => {
    if (task.status === 'done') return false;
    if (!task.due_date) return false;
    return new Date(task.due_date) < new Date();
  }).length;

  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const handleCreateTask = (taskData: any) => {
    createTask(taskData);
    setIsTaskFormOpen(false);
  };

  const handleCreateProject = (projectData: any) => {
    createProject(projectData);
    setIsProjectFormOpen(false);
  };

  const handleCreateGoal = (goalData: any) => {
    createGoal(goalData);
    setIsGoalFormOpen(false);
  };

  const handleToggleTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      updateTask({
        id: taskId,
        updates: { status: task.status === 'done' ? 'todo' : 'done' }
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header com Data e Hora */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Bem-vindo, {user?.email?.split('@')[0]}!
        </h1>
        <DateTimeDisplay />
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <CheckCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tarefas Concluídas</p>
                <p className="text-2xl font-bold">{completedTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/20">
                <Target className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Metas Ativas</p>
                <p className="text-2xl font-bold">{goals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <FolderKanban className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Projetos</p>
                <p className="text-2xl font-bold">{projects.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/20">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Em Atraso</p>
                <p className="text-2xl font-bold">{overdueTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tarefas do Dia */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Tarefas do Dia
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma tarefa para hoje</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {todayTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-white/10 hover:border-white/20 transition-all"
                  >
                    <button
                      onClick={() => handleToggleTask(task.id)}
                      className="flex-shrink-0"
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        task.status === 'done' 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : 'border-muted-foreground hover:border-primary'
                      }`}>
                        {task.status === 'done' && <CheckCircle className="w-3 h-3" />}
                      </div>
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`font-medium truncate ${
                          task.status === 'done' ? 'line-through text-muted-foreground' : ''
                        }`}>
                          {task.title}
                        </p>
                        <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
                          {getPriorityIcon(task.priority)} {task.priority}
                        </Badge>
                      </div>
                      {task.start_time && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Clock className="w-3 h-3" />
                          {task.start_time} {task.end_time && `- ${task.end_time}`}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progresso Geral */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-accent" />
              Progresso Geral
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Taxa de Conclusão</span>
                <span className="font-medium">{Math.round(completionRate)}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total de Tarefas</span>
                <span className="font-medium">{totalTasks}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Concluídas</span>
                <span className="font-medium text-green-400">{completedTasks}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Em Andamento</span>
                <span className="font-medium text-blue-400">{totalTasks - completedTasks}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Dialog open={isTaskFormOpen} onOpenChange={setIsTaskFormOpen}>
              <DialogTrigger asChild>
                <Button className="h-20 glow-button flex-col gap-2">
                  <Plus className="w-6 h-6" />
                  Nova Tarefa
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                <TaskForm 
                  onSubmit={handleCreateTask} 
                  onCancel={() => setIsTaskFormOpen(false)} 
                />
              </DialogContent>
            </Dialog>

            <Dialog open={isProjectFormOpen} onOpenChange={setIsProjectFormOpen}>
              <DialogTrigger asChild>
                <Button className="h-20 glow-button flex-col gap-2">
                  <FolderKanban className="w-6 h-6" />
                  Novo Projeto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                <ProjectForm 
                  onSubmit={handleCreateProject} 
                  onCancel={() => setIsProjectFormOpen(false)} 
                />
              </DialogContent>
            </Dialog>

            <Dialog open={isGoalFormOpen} onOpenChange={setIsGoalFormOpen}>
              <DialogTrigger asChild>
                <Button className="h-20 glow-button flex-col gap-2">
                  <Target className="w-6 h-6" />
                  Nova Meta
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                <GoalForm 
                  onSubmit={handleCreateGoal} 
                  onCancel={() => setIsGoalFormOpen(false)} 
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Navegação Rápida */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Navegação Rápida</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-16 neon-border justify-start"
              onClick={() => window.location.href = '/projects'}
            >
              <FolderKanban className="w-5 h-5 mr-3" />
              Ir para Projetos
            </Button>
            
            <Button 
              variant="outline" 
              className="h-16 neon-border justify-start"
              onClick={() => window.location.href = '/goals'}
            >
              <Target className="w-5 h-5 mr-3" />
              Ir para Metas
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
