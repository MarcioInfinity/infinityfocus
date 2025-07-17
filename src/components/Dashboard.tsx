
import { useState } from 'react';
import { Plus, Target, FolderKanban, CheckCircle2, Calendar, TrendingUp, Users, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { DashboardStats } from './DashboardStats';
import { TaskForm } from './forms/TaskForm';
import { ProjectForm } from './forms/ProjectForm';
import { GoalForm } from './forms/GoalForm';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useGoals } from '@/hooks/useGoals';
import { useRealtime } from '@/hooks/useRealtime';

export function Dashboard() {
  const { user } = useAuth();
  const { tasks, createTask, updateTask } = useTasks();
  const { projects, createProject } = useProjects();
  const { goals, createGoal } = useGoals();

  // Habilitar atualizações em tempo real
  useRealtime();

  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);

  // Estatísticas rápidas
  const todayTasks = tasks.filter(task => {
    const today = new Date().toDateString();
    const taskDate = task.due_date ? new Date(task.due_date).toDateString() : null;
    return taskDate === today;
  });

  const completedToday = todayTasks.filter(task => task.status === 'done');
  const pendingTasks = tasks.filter(task => task.status !== 'done');
  const highPriorityTasks = pendingTasks.filter(task => task.priority === 'high');

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

  const handleToggleTask = (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'done' ? 'todo' : 'done';
    updateTask({ id: taskId, updates: { status: newStatus } });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Bem-vindo de volta, {user?.email?.split('@')[0]}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe seu progresso e gerencie suas atividades
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="glass-card">
            <Bell className="w-3 h-3 mr-1" />
            Atualizações em tempo real ativadas
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <DashboardStats />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Dialog open={isTaskFormOpen} onOpenChange={setIsTaskFormOpen}>
          <DialogTrigger asChild>
            <Card className="glass-card hover:scale-105 transition-transform cursor-pointer">
              <CardContent className="flex items-center justify-center p-6">
                <div className="text-center">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-1">Nova Tarefa</h3>
                  <p className="text-sm text-muted-foreground">Criar uma nova tarefa</p>
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <TaskForm 
              onSubmit={handleCreateTask} 
              onCancel={() => setIsTaskFormOpen(false)} 
            />
          </DialogContent>
        </Dialog>

        <Dialog open={isProjectFormOpen} onOpenChange={setIsProjectFormOpen}>
          <DialogTrigger asChild>
            <Card className="glass-card hover:scale-105 transition-transform cursor-pointer">
              <CardContent className="flex items-center justify-center p-6">
                <div className="text-center">
                  <FolderKanban className="w-12 h-12 mx-auto mb-3 text-accent" />
                  <h3 className="font-semibold mb-1">Novo Projeto</h3>
                  <p className="text-sm text-muted-foreground">Criar um novo projeto</p>
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <ProjectForm 
              onSubmit={handleCreateProject} 
              onCancel={() => setIsProjectFormOpen(false)} 
            />
          </DialogContent>
        </Dialog>

        <Dialog open={isGoalFormOpen} onOpenChange={setIsGoalFormOpen}>
          <DialogTrigger asChild>
            <Card className="glass-card hover:scale-105 transition-transform cursor-pointer">
              <CardContent className="flex items-center justify-center p-6">
                <div className="text-center">
                  <Target className="w-12 h-12 mx-auto mb-3 text-secondary" />
                  <h3 className="font-semibold mb-1">Nova Meta</h3>
                  <p className="text-sm text-muted-foreground">Definir uma nova meta</p>
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <GoalForm 
              onSubmit={handleCreateGoal} 
              onCancel={() => setIsGoalFormOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks */}
        <Card className="glass-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Tarefas de Hoje
              <Badge variant="outline">{todayTasks.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayTasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Nenhuma tarefa para hoje</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Aproveite para planejar ou descansar! 😊
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayTasks.map(task => (
                  <div
                    key={task.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      task.status === 'done' 
                        ? 'bg-green-500/10 border-green-500/20' 
                        : 'bg-card border-border hover:border-primary/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={task.status === 'done'}
                      onChange={() => handleToggleTask(task.id, task.status)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-2"
                    />
                    <div className="flex-1">
                      <p className={`font-medium ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                      )}
                    </div>
                    <Badge 
                      variant="outline" 
                      className={
                        task.priority === 'high' ? 'border-red-500/50 text-red-400' :
                        task.priority === 'medium' ? 'border-yellow-500/50 text-yellow-400' :
                        'border-green-500/50 text-green-400'
                      }
                    >
                      {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Overview */}
        <div className="space-y-6">
          {/* Progress Card */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                Progresso Hoje
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Tarefas Concluídas</span>
                  <span>{completedToday.length}/{todayTasks.length}</span>
                </div>
                <Progress 
                  value={todayTasks.length > 0 ? (completedToday.length / todayTasks.length) * 100 : 0} 
                  className="h-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{pendingTasks.length}</p>
                  <p className="text-xs text-muted-foreground">Pendentes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-400">{highPriorityTasks.length}</p>
                  <p className="text-xs text-muted-foreground">Alta Prioridade</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Projects Summary */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-secondary" />
                Projetos Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {projects.length === 0 ? (
                <div className="text-center py-4">
                  <FolderKanban className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">Nenhum projeto</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {projects.slice(0, 3).map(project => (
                    <div key={project.id} className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: project.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{project.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress 
                            value={project.tasks ? (project.tasks.filter(t => t.status === 'done').length / Math.max(project.tasks.length, 1)) * 100 : 0} 
                            className="h-1 flex-1"
                          />
                          <span className="text-xs text-muted-foreground">
                            {project.members?.length || 0} membro{(project.members?.length || 0) !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {projects.length > 3 && (
                    <p className="text-xs text-muted-foreground text-center pt-2">
                      +{projects.length - 3} projeto{projects.length - 3 !== 1 ? 's' : ''} adicional{projects.length - 3 !== 1 ? 'is' : ''}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
