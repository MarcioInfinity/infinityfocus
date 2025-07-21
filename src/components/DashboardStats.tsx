import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Target, TrendingUp, AlertTriangle, Calendar } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useGoals } from '@/hooks/useGoals';

export function DashboardStats() {
  const { tasks, isLoading: tasksLoading } = useTasks();
  const { projects, isLoading: projectsLoading } = useProjects();
  const { goals, isLoading: goalsLoading } = useGoals();

  const stats = useMemo(() => {
    // Task statistics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'done').length;
    const pendingTasks = totalTasks - completedTasks;
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Overdue tasks
    const overdueTasks = tasks.filter(task => 
      task.due_date && 
      new Date(task.due_date) < new Date() && 
      task.status !== 'done'
    ).length;

    // Upcoming deadlines (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const upcomingDeadlines = tasks.filter(task => 
      task.due_date && 
      new Date(task.due_date) <= nextWeek && 
      new Date(task.due_date) >= new Date() &&
      task.status !== 'done'
    ).length;

    // Project statistics
    const totalProjects = projects.length;
    const activeProjects = projects.filter(project => 
      !project.due_date || new Date(project.due_date) >= new Date()
    ).length;

    // Goal statistics
    const totalGoals = goals.length;
    const averageGoalProgress = goals.length > 0 
      ? Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length)
      : 0;
    const completedGoals = goals.filter(goal => goal.progress >= 100).length;

    // High priority items
    const highPriorityItems = [
      ...tasks.filter(task => task.priority === 'high' && task.status !== 'done'),
      ...projects.filter(project => project.priority === 'high'),
      ...goals.filter(goal => goal.priority === 'high' && goal.progress < 100)
    ].length;

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      taskCompletionRate,
      overdueTasks,
      upcomingDeadlines,
      totalProjects,
      activeProjects,
      totalGoals,
      averageGoalProgress,
      completedGoals,
      highPriorityItems,
    };
  }, [tasks, projects, goals]);

  if (tasksLoading || projectsLoading || goalsLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="glass-card animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-muted rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Task Completion */}
      <Card className="glass-card hover:scale-105 transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Conclusão de Tarefas</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary mb-2">
            {stats.taskCompletionRate}%
          </div>
          <div className="space-y-2">
            <Progress value={stats.taskCompletionRate} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {stats.completedTasks} de {stats.totalTasks} tarefas concluídas
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Pending Tasks & Alerts */}
      <Card className="glass-card hover:scale-105 transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tarefas Pendentes</CardTitle>
          <Clock className="h-4 w-4 text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary mb-2">
            {stats.pendingTasks}
          </div>
          <div className="flex gap-2 flex-wrap">
            {stats.overdueTasks > 0 && (
              <Badge variant="destructive" className="text-xs">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {stats.overdueTasks} atrasadas
              </Badge>
            )}
            {stats.upcomingDeadlines > 0 && (
              <Badge variant="outline" className="text-xs text-yellow-400 border-yellow-400">
                <Calendar className="w-3 h-3 mr-1" />
                {stats.upcomingDeadlines} próximas
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Projects */}
      <Card className="glass-card hover:scale-105 transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
          <Target className="h-4 w-4 text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary mb-2">
            {stats.activeProjects}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.totalProjects} projetos no total
          </p>
          {stats.highPriorityItems > 0 && (
            <Badge variant="outline" className="text-xs text-red-400 border-red-400 mt-2">
              {stats.highPriorityItems} alta prioridade
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Goals Progress */}
      <Card className="glass-card hover:scale-105 transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Progresso das Metas</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary mb-2">
            {stats.averageGoalProgress}%
          </div>
          <div className="space-y-2">
            <Progress value={stats.averageGoalProgress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {stats.completedGoals} de {stats.totalGoals} metas concluídas
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
