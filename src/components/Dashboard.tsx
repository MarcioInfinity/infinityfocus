
import { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, Target, Users, TrendingUp, Plus, Filter, Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { DashboardStats } from './DashboardStats';
import { SearchAndFilter } from './SearchAndFilter';
import { RealtimeNotifications } from './RealtimeNotifications';
import { NotificationManager } from './NotificationManager_new';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useGoals } from '@/hooks/useGoals';
import { useTaskSearch, useProjectSearch, useGoalSearch, useAvailableTags } from '@/hooks/useSearch';
import { supabase } from '@/integrations/supabase/client';
import { useToastNotifications } from '@/hooks/use-toast-notifications';

interface FilterOptions {
  searchTerm: string;
  priority?: string;
  category?: string;
  status?: string;
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  tags: string[];
}

export function Dashboard() {
  const { tasks, updateTask } = useTasks();
  const { projects, updateProject } = useProjects();
  const { goals, updateGoal } = useGoals();
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: '',
    tags: []
  });
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({ title: '', name: '' });
  const { showSuccessToast } = useToastNotifications();

  const availableTags = useAvailableTags(tasks);
  const filteredTasks = useTaskSearch(tasks, filters);
  const filteredProjects = useProjectSearch(projects, filters);
  const filteredGoals = useGoalSearch(goals, filters);

  // Realtime subscription for live updates
  useEffect(() => {
    const tasksChannel = supabase
      .channel('dashboard-tasks')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'tasks' 
      }, () => {
        // Force refresh tasks data
        window.location.reload();
      })
      .subscribe();

    const projectsChannel = supabase
      .channel('dashboard-projects')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'projects' 
      }, () => {
        // Force refresh projects data
        window.location.reload();
      })
      .subscribe();

    const goalsChannel = supabase
      .channel('dashboard-goals')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'goals' 
      }, () => {
        // Force refresh goals data
        window.location.reload();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(projectsChannel);
      supabase.removeChannel(goalsChannel);
    };
  }, []);

  // Get recent activities with better performance
  const recentTasks = tasks
    .filter(task => task.status !== 'done')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);
  
  const upcomingDeadlines = tasks
    .filter(task => task.due_date && task.status !== 'done')
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
    .slice(0, 5);

  const priorityColors = {
    low: 'bg-green-500/20 text-green-400 border-green-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    high: 'bg-red-500/20 text-red-400 border-red-500/30'
  };

  const statusColors = {
    todo: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    'in-progress': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    review: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    done: 'bg-green-500/20 text-green-400 border-green-500/30'
  };

  const getDaysUntilDeadline = (dueDate: string) => {
    const days = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const handleTaskStatusChange = async (taskId: string, completed: boolean) => {
    try {
      await updateTask({ 
        id: taskId, 
        updates: { status: completed ? 'done' : 'todo' } 
      });
      showSuccessToast(completed ? 'Tarefa concluída!' : 'Tarefa reaberta!');
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleStartEdit = (type: 'task' | 'project' | 'goal', id: string, currentValue: string) => {
    if (type === 'task') {
      setEditingTask(id);
      setEditValues({ title: currentValue, name: '' });
    } else if (type === 'project') {
      setEditingProject(id);
      setEditValues({ title: '', name: currentValue });
    } else {
      setEditingGoal(id);
      setEditValues({ title: '', name: currentValue });
    }
  };

  const handleSaveEdit = async (type: 'task' | 'project' | 'goal', id: string) => {
    try {
      if (type === 'task' && editValues.title.trim()) {
        await updateTask({ id, updates: { title: editValues.title.trim() } });
        showSuccessToast('Título da tarefa atualizado!');
      } else if (type === 'project' && editValues.name.trim()) {
        await updateProject({ id, updates: { name: editValues.name.trim() } });
        showSuccessToast('Nome do projeto atualizado!');
      } else if (type === 'goal' && editValues.name.trim()) {
        await updateGoal({ id, updates: { name: editValues.name.trim() } });
        showSuccessToast('Nome da meta atualizado!');
      }
      handleCancelEdit();
    } catch (error) {
      console.error('Error updating:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setEditingProject(null);
    setEditingGoal(null);
    setEditValues({ title: '', name: '' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Notifications */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Visão geral das suas atividades e progresso
          </p>
        </div>
        <div className="flex items-center gap-4">
          <RealtimeNotifications />
          <Button className="glow-button">
            <Plus className="w-4 h-4 mr-2" />
            Ação Rápida
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <DashboardStats />

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 glass-card">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="tasks">Tarefas</TabsTrigger>
          <TabsTrigger value="projects">Projetos</TabsTrigger>
          <TabsTrigger value="goals">Metas</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Tasks with Interactive Features */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Tarefas Recentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentTasks.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Nenhuma tarefa pendente
                  </p>
                ) : (
                  recentTasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Checkbox
                          checked={task.status === 'done'}
                          onCheckedChange={(checked) => handleTaskStatusChange(task.id, checked as boolean)}
                          className="shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          {editingTask === task.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={editValues.title}
                                onChange={(e) => setEditValues(prev => ({ ...prev, title: e.target.value }))}
                                className="h-8 text-sm"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveEdit('task', task.id);
                                  if (e.key === 'Escape') handleCancelEdit();
                                }}
                                autoFocus
                              />
                              <Button size="sm" variant="ghost" onClick={() => handleSaveEdit('task', task.id)}>
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 group">
                              <h4 className={`font-medium truncate ${task.status === 'done' ? 'line-through opacity-60' : ''}`}>
                                {task.title}
                              </h4>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleStartEdit('task', task.id, task.title)}
                              >
                                <Edit2 className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className={priorityColors[task.priority]}>
                              {task.priority}
                            </Badge>
                            <Badge variant="outline" className={statusColors[task.status]}>
                              {task.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {task.due_date && (
                        <div className="text-xs text-muted-foreground">
                          {new Date(task.due_date).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Upcoming Deadlines */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Próximos Prazos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingDeadlines.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Nenhum prazo próximo
                  </p>
                ) : (
                  upcomingDeadlines.map(task => {
                    const daysLeft = getDaysUntilDeadline(task.due_date!);
                    return (
                      <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Checkbox
                            checked={task.status === 'done'}
                            onCheckedChange={(checked) => handleTaskStatusChange(task.id, checked as boolean)}
                            className="shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-medium truncate ${task.status === 'done' ? 'line-through opacity-60' : ''}`}>
                              {task.title}
                            </h4>
                            <Badge variant="outline" className={priorityColors[task.priority]}>
                              {task.priority}
                            </Badge>
                          </div>
                        </div>
                        <div className={`text-xs font-medium ${daysLeft < 0 ? 'text-red-400' : daysLeft < 3 ? 'text-yellow-400' : 'text-muted-foreground'}`}>
                          {daysLeft < 0 ? `${Math.abs(daysLeft)}d atraso` : daysLeft === 0 ? 'Hoje!' : `${daysLeft}d restantes`}
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <SearchAndFilter onFiltersChange={setFilters} availableTags={availableTags} showStatusFilter={true} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map(task => (
              <Card key={task.id} className="glass-card hover:scale-105 transition-transform">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <Checkbox
                      checked={task.status === 'done'}
                      onCheckedChange={(checked) => handleTaskStatusChange(task.id, checked as boolean)}
                      className="mt-1 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      {editingTask === task.id ? (
                        <div className="flex items-center gap-2 mb-2">
                          <Input
                            value={editValues.title}
                            onChange={(e) => setEditValues(prev => ({ ...prev, title: e.target.value }))}
                            className="h-8 text-sm"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit('task', task.id);
                              if (e.key === 'Escape') handleCancelEdit();
                            }}
                            autoFocus
                          />
                          <Button size="sm" variant="ghost" onClick={() => handleSaveEdit('task', task.id)}>
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 group mb-2">
                          <h3 className={`font-semibold ${task.status === 'done' ? 'line-through opacity-60' : ''}`}>
                            {task.title}
                          </h3>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleStartEdit('task', task.id, task.title)}
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                      <div className="flex gap-2 mb-3">
                        <Badge variant="outline" className={priorityColors[task.priority]}>
                          {task.priority}
                        </Badge>
                        <Badge variant="outline" className={statusColors[task.status]}>
                          {task.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {task.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                  {task.due_date && (
                    <p className="text-xs text-muted-foreground">
                      Prazo: {new Date(task.due_date).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <SearchAndFilter onFiltersChange={setFilters} showStatusFilter={false} showTagFilter={false} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map(project => (
              <Card key={project.id} className="glass-card hover:scale-105 transition-transform">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
                    {editingProject === project.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          value={editValues.name}
                          onChange={(e) => setEditValues(prev => ({ ...prev, name: e.target.value }))}
                          className="h-8 text-sm"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit('project', project.id);
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          autoFocus
                        />
                        <Button size="sm" variant="ghost" onClick={() => handleSaveEdit('project', project.id)}>
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 group flex-1">
                        <h3 className="font-semibold">{project.name}</h3>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleStartEdit('project', project.id, project.name)}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <Badge variant="outline" className={priorityColors[project.priority]}>
                    {project.priority}
                  </Badge>
                  {project.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  {project.due_date && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Prazo: {new Date(project.due_date).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <SearchAndFilter onFiltersChange={setFilters} showStatusFilter={false} showTagFilter={false} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGoals.map(goal => (
              <Card key={goal.id} className="glass-card hover:scale-105 transition-transform">
                <CardContent className="p-4">
                  {editingGoal === goal.id ? (
                    <div className="flex items-center gap-2 mb-2">
                      <Input
                        value={editValues.name}
                        onChange={(e) => setEditValues(prev => ({ ...prev, name: e.target.value }))}
                        className="h-8 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit('goal', goal.id);
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                        autoFocus
                      />
                      <Button size="sm" variant="ghost" onClick={() => handleSaveEdit('goal', goal.id)}>
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group mb-2">
                      <h3 className="font-semibold">{goal.name}</h3>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleStartEdit('goal', goal.id, goal.name)}
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                  <div className="flex gap-2 mb-3">
                    <Badge variant="outline" className={priorityColors[goal.priority]}>
                      {goal.priority}
                    </Badge>
                    <Badge variant="outline">
                      {goal.progress}%
                    </Badge>
                  </div>
                  {goal.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {goal.description}
                    </p>
                  )}
                  {goal.due_date && (
                    <p className="text-xs text-muted-foreground">
                      Prazo: {new Date(goal.due_date).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <NotificationManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
