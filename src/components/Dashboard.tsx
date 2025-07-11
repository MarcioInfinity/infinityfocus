
import { useState, useEffect } from 'react';
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  FolderKanban, 
  TrendingUp,
  Plus,
  Bell,
  Target,
  Trophy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Task, Project, Goal } from '@/types';
import { TaskForm } from './forms/TaskForm';
import { ProjectForm } from './forms/ProjectForm';
import { GoalForm } from './forms/GoalForm';
import { useToastNotifications } from '@/hooks/use-toast-notifications';

// Mock data for demonstration - will be replaced with Supabase data
const mockTasks: Task[] = [];
const mockProjects: Project[] = [];
const mockGoals: Goal[] = [];

export function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [goals, setGoals] = useState<Goal[]>(mockGoals);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);
  
  const { showSuccessToast } = useToastNotifications();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const todayTasks = tasks.filter(task => {
    if (!task.due_date) return false;
    const today = new Date().toDateString();
    const taskDate = new Date(task.due_date).toDateString();
    return today === taskDate;
  });

  const overdueTasks = tasks.filter(task => {
    if (!task.due_date) return false;
    return new Date(task.due_date) < new Date() && task.status !== 'done';
  });

  const completedTasks = tasks.filter(task => task.status === 'done');
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;

  const handleCreateTask = (taskData: any) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority,
      status: 'todo' as const,
      category: taskData.category,
      start_date: taskData.start_date?.toISOString(),
      due_date: taskData.due_date?.toISOString(),
      is_indefinite: taskData.is_indefinite,
      start_time: taskData.time,
      notifications_enabled: taskData.notify_enabled,
      repeat_enabled: taskData.frequency_enabled,
      repeat_type: taskData.frequency_type,
      repeat_days: taskData.frequency_days?.map(String),
      project_id: taskData.assign_to_project ? taskData.project_id : undefined,
      assigned_to: undefined,
      created_by: 'current-user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      notifications: [],
      tags: [],
      checklist: taskData.checklist || [],
    };
    setTasks([...tasks, newTask]);
    setIsTaskFormOpen(false);
    showSuccessToast('Tarefa criada com sucesso!');
  };

  const handleCreateProject = (projectData: any) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: projectData.name,
      description: projectData.description,
      color: projectData.color,
      owner_id: 'current-user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      members: [],
      tasks: []
    };
    setProjects([...projects, newProject]);
    setIsProjectFormOpen(false);
    showSuccessToast('Projeto criado com sucesso!');
  };

  const handleCreateGoal = (goalData: any) => {
    const newGoal: Goal = {
      id: Date.now().toString(),
      title: goalData.title,
      description: goalData.description,
      target_value: goalData.target_value,
      current_value: 0,
      unit: goalData.unit,
      category: goalData.category,
      start_date: goalData.start_date,
      target_date: goalData.target_date,
      is_active: true,
      created_by: 'current-user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      milestones: []
    };
    setGoals([...goals, newGoal]);
    setIsGoalFormOpen(false);
    showSuccessToast('Meta criada com sucesso!');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            {currentTime.toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isTaskFormOpen} onOpenChange={setIsTaskFormOpen}>
            <DialogTrigger asChild>
              <Button className="glow-button">
                <Plus className="w-4 h-4 mr-2" />
                Nova Tarefa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <TaskForm
                onSubmit={handleCreateTask}
                onCancel={() => setIsTaskFormOpen(false)}
                projects={projects}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={isProjectFormOpen} onOpenChange={setIsProjectFormOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="neon-border">
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

          <Dialog open={isGoalFormOpen} onOpenChange={setIsGoalFormOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="neon-border">
                <Plus className="w-4 h-4 mr-2" />
                Nova Meta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <GoalForm
                onSubmit={handleCreateGoal}
                onCancel={() => setIsGoalFormOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card animate-float">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarefas Hoje</CardTitle>
            <Calendar className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{todayTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              {todayTasks.length === 0 ? 'Nenhuma tarefa hoje' : 'tarefas programadas'}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card animate-float" style={{ animationDelay: '0.1s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Atraso</CardTitle>
            <Clock className="w-4 h-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overdueTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              {overdueTasks.length === 0 ? 'Tudo em dia!' : 'tarefas atrasadas'}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card animate-float" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
            <FolderKanban className="w-4 h-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{projects.length}</div>
            <p className="text-xs text-muted-foreground">
              {projects.length === 0 ? 'Nenhum projeto' : 'projetos em andamento'}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card animate-float" style={{ animationDelay: '0.3s' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
            <Target className="w-4 h-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{Math.round(completionRate)}%</div>
            <Progress value={completionRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              Tarefas de Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma tarefa programada para hoje</p>
                <Button 
                  className="mt-4 glow-button" 
                  size="sm"
                  onClick={() => setIsTaskFormOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Tarefa
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {todayTasks.map((task) => (
                  <div key={task.id} className="task-card">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          task.priority === 'high' ? 'bg-red-500' :
                          task.priority === 'medium' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`} />
                        <div>
                          <h4 className="font-medium">{task.title}</h4>
                          {task.description && (
                            <p className="text-sm text-muted-foreground">{task.description}</p>
                          )}
                        </div>
                      </div>
                      <Button size="sm" variant="ghost">
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Projects */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-accent" />
              Projetos Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FolderKanban className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum projeto criado ainda</p>
                <Button 
                  className="mt-4 glow-button" 
                  size="sm"
                  onClick={() => setIsProjectFormOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Projeto
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {projects.slice(0, 5).map((project) => (
                  <div key={project.id} className="project-card">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: project.color }}
                        />
                        <div>
                          <h4 className="font-medium">{project.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {project.members.length} membro{project.members.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {project.tasks.filter(t => t.status === 'done').length}/{project.tasks.length} tarefas
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Goals */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Metas Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {goals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma meta definida ainda</p>
                <Button 
                  className="mt-4 glow-button" 
                  size="sm"
                  onClick={() => setIsGoalFormOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Meta
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {goals.slice(0, 3).map((goal) => {
                  const progress = goal.target_value > 0 ? (goal.current_value / goal.target_value) * 100 : 0;
                  return (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">{goal.title}</h4>
                        <span className="text-xs text-muted-foreground">
                          {goal.current_value}/{goal.target_value} {goal.unit}
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Floating Action Button */}
      <Button 
        className="floating-action animate-glow"
        onClick={() => setIsTaskFormOpen(true)}
      >
        <Plus className="w-6 h-6" />
      </Button>
    </div>
  );
}
