import { useState, useEffect } from 'react';
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
import { useNotifications } from '@/hooks/useNotifications';
import { useUserSettings } from '@/hooks/useUserSettings';
import { getCurrentDateAndDay } from '@/utils/dateTime';
import { Task, Project, Goal } from '@/types';

export function Dashboard() {
  const { user } = useAuth();
  // CORREÇÃO #2: Usar hook melhorado de tarefas
  const { tasks, todayTasks, createTask, updateTask } = useTasks();
  const { projects, createProject } = useProjects();
  const { goals, createGoal } = useGoals();
  const { settings } = useUserSettings();
  const { requestNotificationPermission, showBrowserNotification } = useNotifications();

  // Habilitar atualizações em tempo real
  useRealtime();

  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState('');

  // Update current date and time every minute
  useEffect(() => {
    const updateDateTime = () => {
      const timezone = settings?.timezone || 'America/Sao_Paulo';
      setCurrentDateTime(getCurrentDateAndDay(timezone));
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [settings]);

  // Request notification permission on component mount
  useEffect(() => {
    requestNotificationPermission().then(permissionGranted => {
      if (permissionGranted) {
        console.log('Notification permission granted.');
      } else {
        console.log('Notification permission denied or not supported.');
      }
    });
  }, []);

  // Logic to show notifications for upcoming tasks
  useEffect(() => {
    const now = new Date();
    tasks.forEach(task => {
      if (task.due_date && task.notifications_enabled) {
        const dueDate = new Date(task.due_date);
        // Check if due date is today and task is not done
        if (dueDate.toDateString() === now.toDateString() && task.status !== 'done') {
          showBrowserNotification(`Tarefa Próxima: ${task.title}`, {
            body: `A tarefa '${task.title}' vence hoje!`, 
            tag: task.id
          });
        }
      }
    });
  }, [tasks, showBrowserNotification]);



  const completedToday = tasks.filter(task => {
    if (task.status !== 'done') return false;
    
    const today = new Date();
    const updatedDate = new Date(task.updated_at);
    return updatedDate.toDateString() === today.toDateString();
  });
  
  const pendingTasks = tasks.filter(task => task.status !== 'done');

  const highPriorityTasks = pendingTasks.filter(task => task.priority === 'high');

  const handleCreateTask = (taskData: Task) => {
    createTask(taskData);
    setIsTaskFormOpen(false);
  };

  const handleCreateProject = (projectData: Project) => {
    createProject(projectData);
    setIsProjectFormOpen(false);
  };

  const handleCreateGoal = (goalData: Goal) => {
    createGoal(goalData);
    setIsGoalFormOpen(false);
  };

  const handleToggleTask = (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'done' ? 'todo' : 'done';
    updateTask({ id: taskId, updates: { status: newStatus } });
  };

  // Format time for display
  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    try {
      const [hours, minutes] = timeString.split(':');
      return `${hours}:${minutes}`;
    } catch {
      return timeString;
    }
  };

  // Format date with time for display
  const formatDateWithTime = (dateString: string, timeString?: string) => {
    try {
      const date = new Date(dateString);
      const dateFormatted = date.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      
      if (timeString) {
        return `${dateFormatted} às ${formatTime(timeString)}`;
      }
      
      return dateFormatted;
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Bem-vindo de volta, {user?.email?.split('@')[0]}!
          </h1>
          <p className="text-muted-foreground mt-1">
            {currentDateTime}
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
          <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
            <TaskForm 
              onSubmit={handleCreateTask} 
              onCancel={() => setIsTaskFormOpen(false)}
              projects={projects}
              goals={goals}
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
          <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
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
          <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
            <GoalForm 
              onSubmit={handleCreateGoal} 
              onCancel={() => setIsGoalFormOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks - CORREÇÃO #2: Usar todayTasks do hook melhorado */}
        <Card className="glass-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Tarefas de Hoje
              <Badge variant="outline">{todayTasks.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="today" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="today">Hoje</TabsTrigger>
                <TabsTrigger value="all">Todas as Tarefas</TabsTrigger>
              </TabsList>
              <TabsContent value="today">
                {todayTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">Nenhuma tarefa para hoje</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Aproveite para planejar ou descansar! 😊
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* 1. TAREFAS ATRASADAS */}
                    {todayTasks.some(task => {
                      const isOverdue = task.due_date && new Date(task.due_date).setHours(0,0,0,0) < new Date().setHours(0,0,0,0) && task.status !== 'done';
                      return isOverdue;
                    }) && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-red-400 flex items-center gap-2">
                          ⚠️ Tarefas Atrasadas
                        </h4>
                        <div className="space-y-2">
                          {todayTasks.filter(task => {
                            const isOverdue = task.due_date && new Date(task.due_date).setHours(0,0,0,0) < new Date().setHours(0,0,0,0) && task.status !== 'done';
                            return isOverdue;
                          }).map(task => (
                            <div
                              key={task.id}
                              className="flex items-center gap-3 p-3 rounded-lg border bg-red-500/10 border-red-500/20 transition-all"
                            >
                              <input
                                type="checkbox"
                                checked={task.status === 'done'}
                                onChange={() => handleToggleTask(task.id, task.status)}
                                className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-2"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className={`font-medium ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                                    {task.title}
                                  </p>
                                  <Badge variant="destructive" className="text-xs">
                                    Atrasada
                                  </Badge>
                                </div>
                                {task.description && (
                                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{task.description}</p>
                                )}
                                <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                                  {task.start_time && (
                                    <span className="flex items-center gap-1">
                                      🕐 {formatTime(task.start_time)}
                                    </span>
                                  )}
                                  {task.due_date && (
                                    <span className="flex items-center gap-1">
                                      📅 {formatDateWithTime(task.due_date, task.start_time)}
                                    </span>
                                  )}
                                </div>
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
                      </div>
                    )}

                    {/* 2. TAREFAS DO DIA */}
                    {todayTasks.some(task => {
                      const isDueToday = task.due_date && new Date(task.due_date).toDateString() === new Date().toDateString() && task.status !== 'done';
                      const isNotOverdue = !(task.due_date && new Date(task.due_date).setHours(0,0,0,0) < new Date().setHours(0,0,0,0));
                      return isDueToday && isNotOverdue;
                    }) && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-yellow-400 flex items-center gap-2">
                          📅 Tarefas de Hoje
                        </h4>
                        <div className="space-y-2">
                          {todayTasks.filter(task => {
                            const isDueToday = task.due_date && new Date(task.due_date).toDateString() === new Date().toDateString() && task.status !== 'done';
                            const isNotOverdue = !(task.due_date && new Date(task.due_date).setHours(0,0,0,0) < new Date().setHours(0,0,0,0));
                            return isDueToday && isNotOverdue;
                          }).map(task => (
                            <div
                              key={task.id}
                              className="flex items-center gap-3 p-3 rounded-lg border bg-yellow-500/10 border-yellow-500/20 transition-all"
                            >
                              <input
                                type="checkbox"
                                checked={task.status === 'done'}
                                onChange={() => handleToggleTask(task.id, task.status)}
                                className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-2"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className={`font-medium ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                                    {task.title}
                                  </p>
                                  <Badge variant="outline" className="text-xs bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                                    Vence Hoje
                                  </Badge>
                                </div>
                                {task.description && (
                                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{task.description}</p>
                                )}
                                <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                                  {task.start_time && (
                                    <span className="flex items-center gap-1">
                                      🕐 {formatTime(task.start_time)}
                                    </span>
                                  )}
                                  {task.due_date && (
                                    <span className="flex items-center gap-1">
                                      📅 {formatDateWithTime(task.due_date, task.start_time)}
                                    </span>
                                  )}
                                </div>
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
                      </div>
                    )}

                    {/* 3. TAREFAS COM REPETIÇÃO */}
                    {todayTasks.some(task => {
                      const isRepeatingToday = task.repeat_enabled && (
                        (task.repeat_type === 'daily') ||
                        (task.repeat_type === 'weekly' && task.repeat_days?.includes(new Date().getDay().toString())) ||
                        (task.repeat_type === 'monthly' && parseInt(task.repeat_days?.[0] || '0') === new Date().getDate()) ||
                        (task.repeat_type === 'custom' && task.repeat_days?.some(d => new Date(d).toDateString() === new Date().toDateString()))
                      );
                      const isNotDueToday = !(task.due_date && new Date(task.due_date).toDateString() === new Date().toDateString());
                      const isNotOverdue = !(task.due_date && new Date(task.due_date).setHours(0,0,0,0) < new Date().setHours(0,0,0,0));
                      return isRepeatingToday && isNotDueToday && isNotOverdue;
                    }) && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-blue-400 flex items-center gap-2">
                          🔄 Tarefas com Repetição
                        </h4>
                        <div className="space-y-2">
                          {todayTasks.filter(task => {
                            const isRepeatingToday = task.repeat_enabled && (
                              (task.repeat_type === 'daily') ||
                              (task.repeat_type === 'weekly' && task.repeat_days?.includes(new Date().getDay().toString())) ||
                              (task.repeat_type === 'monthly' && parseInt(task.repeat_days?.[0] || '0') === new Date().getDate()) ||
                              (task.repeat_type === 'custom' && task.repeat_days?.some(d => new Date(d).toDateString() === new Date().toDateString()))
                            );
                            const isNotDueToday = !(task.due_date && new Date(task.due_date).toDateString() === new Date().toDateString());
                            const isNotOverdue = !(task.due_date && new Date(task.due_date).setHours(0,0,0,0) < new Date().setHours(0,0,0,0));
                            return isRepeatingToday && isNotDueToday && isNotOverdue;
                          }).map(task => (
                            <div
                              key={task.id}
                              className="flex items-center gap-3 p-3 rounded-lg border bg-blue-500/10 border-blue-500/20 transition-all"
                            >
                              <input
                                type="checkbox"
                                checked={task.status === 'done'}
                                onChange={() => handleToggleTask(task.id, task.status)}
                                className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-2"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className={`font-medium ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                                    {task.title}
                                  </p>
                                  <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                                    🔄 {task.repeat_type === 'daily' ? 'Diário' : 
                                        task.repeat_type === 'weekly' ? 'Semanal' :
                                        task.repeat_type === 'monthly' ? 'Mensal' : 'Personalizado'}
                                  </Badge>
                                </div>
                                {task.description && (
                                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{task.description}</p>
                                )}
                                <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                                  {task.start_time && (
                                    <span className="flex items-center gap-1">
                                      🕐 {formatTime(task.start_time)}
                                    </span>
                                  )}
                                  {task.due_date && (
                                    <span className="flex items-center gap-1">
                                      📅 {formatDateWithTime(task.due_date, task.start_time)}
                                    </span>
                                  )}
                                </div>
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
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="all">
                {tasks.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">Nenhuma tarefa cadastrada</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Comece criando sua primeira tarefa! 😊
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tasks.map(task => (
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
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{task.description}</p>
                          )}
                          {/* Exibir horário junto com a data */}
                          <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                            {task.start_time && (
                              <span className="flex items-center gap-1">
                                🕐 ${formatTime(task.start_time)}
                              </span>
                            )}
                            {task.due_date && (
                              <span className="flex items-center gap-1">
                                📅 ${formatDateWithTime(task.due_date, task.start_time)}
                              </span>
                            )}
                            {task.repeat_enabled && (
                              <span className="flex items-center gap-1">
                                🔄 ${task.repeat_type === 'daily' ? 'Diário' : 
                                    task.repeat_type === 'weekly' ? 'Semanal' :
                                    task.repeat_type === 'monthly' ? 'Mensal' : 'Personalizado'}
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={
                            task.priority === 'high' ? 'border-red-500/50 text-red-400' :
                            task.priority === 'medium' ? 'border-yellow-500/50 text-yellow-400' :
                            'border-green-500/50 text-green-400'
                          }
                        >
                          ${task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
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
                  <span>${completedToday.length}/${todayTasks.length}</span>
                </div>
                <Progress 
                  value={todayTasks.length > 0 ? (completedToday.length / todayTasks.length) * 100 : 0} 
                  className="h-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">${pendingTasks.length}</p>
                  <p className="text-xs text-muted-foreground">Pendentes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-400">${highPriorityTasks.length}</p>
                  <p className="text-xs text-muted-foreground">Alta Prioridade</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Projects Summary */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-secondary" />
                  Projetos Ativos
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => window.location.href = '/projects'}
                  className="text-xs hover:text-primary"
                >
                  Ir para Projetos
                </Button>
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
                            ${project.members?.length || 0} membro${(project.members?.length || 0) !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {projects.length > 3 && (
                    <p className="text-xs text-muted-foreground text-center pt-2">
                      +${projects.length - 3} projeto${projects.length - 3 !== 1 ? 's' : ''} adicional${projects.length - 3 !== 1 ? 'is' : ''}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Goals Summary */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-secondary" />
                  Metas Atuais
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => window.location.href = '/goals'}
                  className="text-xs hover:text-primary"
                >
                  Ir para Metas
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {goals.length === 0 ? (
                <div className="text-center py-4">
                  <Target className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">Nenhuma meta definida</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {goals.slice(0, 3).map(goal => (
                    <div key={goal.id} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{goal.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress 
                            value={goal.progress || 0} 
                            className="h-1 flex-1"
                          />
                          <span className="text-xs text-muted-foreground">
                            ${Math.round(goal.progress || 0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {goals.length > 3 && (
                    <p className="text-xs text-muted-foreground text-center pt-2">
                      +${goals.length - 3} meta${goals.length - 3 !== 1 ? 's' : ''} adicional${goals.length - 3 !== 1 ? 'is' : ''}
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

