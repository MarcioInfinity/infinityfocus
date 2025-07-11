import { useState, useEffect, useMemo } from 'react';
import { Calendar, CheckCircle, Clock, FolderKanban, TrendingUp, Plus, Bell, Target, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Task, Project, Goal } from '@/types';
import { TaskForm } from './forms/TaskForm';
import { ProjectForm } from './forms/ProjectForm';
import { GoalForm } from './forms/GoalForm';
import { useToastNotifications } from '@/hooks/use-toast-notifications';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useGoals } from '@/hooks/useGoals';
export function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);
  
  // Real data hooks
  const { tasks, createTask, isLoading: tasksLoading } = useTasks();
  const { projects, createProject, isLoading: projectsLoading } = useProjects();
  const { goals, createGoal, isLoading: goalsLoading } = useGoals();
  
  const { showSuccessToast } = useToastNotifications();
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  // Computed data with better filtering and sorting
  const todayTasks = useMemo(() => {
    const today = new Date().toDateString();
    return tasks
      .filter(task => {
        if (!task.due_date && !task.start_date) return false;
        const taskDate = task.due_date ? new Date(task.due_date).toDateString() : new Date(task.start_date!).toDateString();
        return today === taskDate;
      })
      .sort((a, b) => {
        // Sort by time if available, then by priority
        if (a.start_time && b.start_time) {
          return a.start_time.localeCompare(b.start_time);
        }
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
  }, [tasks]);

  const overdueTasks = useMemo(() => {
    const now = new Date();
    return tasks.filter(task => {
      if (!task.due_date || task.status === 'done') return false;
      return new Date(task.due_date) < now;
    });
  }, [tasks]);

  const recentProjects = useMemo(() => {
    return [...projects]
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5);
  }, [projects]);

  const activeGoals = useMemo(() => {
    return [...goals]
      .filter(goal => goal.progress < 100)
      .sort((a, b) => {
        // Sort by due_date first, then by priority
        if (a.due_date && b.due_date) {
          const dateComparison = new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
          if (dateComparison !== 0) return dateComparison;
        }
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .slice(0, 3);
  }, [goals]);

  const completedTasks = tasks.filter(task => task.status === 'done');
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? completedTasks.length / totalTasks * 100 : 0;
  const handleCreateTask = (taskData: any) => {
    createTask({
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority,
      category: taskData.category,
      start_date: taskData.start_date,
      due_date: taskData.due_date,
      start_time: taskData.time,
      end_time: taskData.end_time,
      is_indefinite: taskData.is_indefinite,
      notifications_enabled: taskData.notify_enabled,
      repeat_enabled: taskData.frequency_enabled,
      repeat_type: taskData.frequency_type,
      repeat_days: taskData.frequency_days,
      project_id: taskData.assign_to_project ? taskData.project_id : undefined,
      goal_id: taskData.goal_id,
      tags: taskData.tags || [],
    });
    setIsTaskFormOpen(false);
  };

  const handleCreateProject = (projectData: any) => {
    createProject({
      name: projectData.name,
      description: projectData.description,
      priority: projectData.priority || 'medium',
      category: projectData.category || 'professional',
      color: projectData.color,
      is_shared: projectData.is_shared || false,
      notifications_enabled: projectData.notifications_enabled || false,
      repeat_enabled: projectData.repeat_enabled || false,
      start_date: projectData.start_date,
      due_date: projectData.due_date,
      start_time: projectData.start_time,
      end_time: projectData.end_time,
      is_indefinite: projectData.is_indefinite,
      repeat_type: projectData.repeat_type,
      repeat_days: projectData.repeat_days,
    });
    setIsProjectFormOpen(false);
  };

  const handleCreateGoal = (goalData: any) => {
    createGoal({
      name: goalData.name,
      description: goalData.description,
      priority: goalData.priority || 'medium',
      category: goalData.category || 'professional',
      start_date: goalData.start_date,
      due_date: goalData.due_date,
      is_shared: goalData.is_shared || false,
      notifications_enabled: goalData.notifications_enabled || false,
      reward_enabled: goalData.reward_enabled || false,
      reward_description: goalData.reward_description,
      notes: goalData.notes,
    });
    setIsGoalFormOpen(false);
  };
  return <div className="space-y-8 animate-fade-in">
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
              
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <TaskForm onSubmit={handleCreateTask} onCancel={() => setIsTaskFormOpen(false)} projects={projects} />
            </DialogContent>
          </Dialog>

          <Dialog open={isProjectFormOpen} onOpenChange={setIsProjectFormOpen}>
            <DialogTrigger asChild>
              
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <ProjectForm onSubmit={handleCreateProject} onCancel={() => setIsProjectFormOpen(false)} />
            </DialogContent>
          </Dialog>

          <Dialog open={isGoalFormOpen} onOpenChange={setIsGoalFormOpen}>
            <DialogTrigger asChild>
              
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <GoalForm onSubmit={handleCreateGoal} onCancel={() => setIsGoalFormOpen(false)} />
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

        <Card className="glass-card animate-float" style={{
        animationDelay: '0.1s'
      }}>
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

        <Card className="glass-card animate-float" style={{
        animationDelay: '0.2s'
      }}>
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

        <Card className="glass-card animate-float" style={{
        animationDelay: '0.3s'
      }}>
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
            {todayTasks.length === 0 ? <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma tarefa programada para hoje</p>
                <Button className="mt-4 glow-button" size="sm" onClick={() => setIsTaskFormOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Tarefa
                </Button>
              </div> : <div className="space-y-3">
                {todayTasks.map(task => <div key={task.id} className="task-card">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                        <div>
                          <h4 className="font-medium">{task.title}</h4>
                          {task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}
                        </div>
                      </div>
                      <Button size="sm" variant="ghost">
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>)}
              </div>}
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
              {recentProjects.length === 0 ? <div className="text-center py-8 text-muted-foreground">
                <FolderKanban className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum projeto criado ainda</p>
                <Button className="mt-4 glow-button" size="sm" onClick={() => setIsProjectFormOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Projeto
                </Button>
              </div> : <div className="space-y-3">
                {recentProjects.map(project => <div key={project.id} className="project-card">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{
                    backgroundColor: project.color
                  }} />
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
                  </div>)}
              </div>}
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
            {activeGoals.length === 0 ? <div className="text-center py-8 text-muted-foreground">
                <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma meta ativa ainda</p>
                <Button className="mt-4 glow-button" size="sm" onClick={() => setIsGoalFormOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Meta
                </Button>
              </div> : <div className="space-y-3">
                {activeGoals.map(goal => <div key={goal.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{goal.name}</h4>
                      <span className="text-xs text-muted-foreground">
                        {goal.progress}%
                      </span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                    {goal.due_date && (
                      <p className="text-xs text-muted-foreground">
                        Prazo: {new Date(goal.due_date).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>)}
              </div>}
          </CardContent>
        </Card>
      </div>

      {/* Floating Action Button */}
      <Button className="floating-action animate-glow" onClick={() => setIsTaskFormOpen(true)}>
        <Plus className="w-6 h-6" />
      </Button>
    </div>;
}