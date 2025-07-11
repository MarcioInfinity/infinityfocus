import { useState } from 'react';
import { Plus, Filter, Search, Calendar, Flag, User, MoreHorizontal, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Task, Priority } from '@/types';
import { TaskForm } from './forms/TaskForm';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useToastNotifications } from '@/hooks/use-toast-notifications';
const priorityColors = {
  low: 'bg-green-500/20 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  high: 'bg-red-500/20 text-red-400 border-red-500/30'
};
const statusIcons = {
  'todo': Clock,
  'in-progress': AlertCircle,
  'review': User,
  'done': CheckCircle
};
export function TaskManager() {
  const [filter, setFilter] = useState<'all' | 'today' | 'overdue' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Real data hooks
  const { tasks, createTask, updateTask, deleteTask, isLoading } = useTasks();
  const { projects } = useProjects();
  const { showSuccessToast } = useToastNotifications();
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
    setIsFormOpen(false);
  };
  const getFilteredTasks = (type: 'personal' | 'shared' | 'all') => {
    let filteredTasks = tasks;

    // Filter by type
    if (type === 'personal') {
      // Personal tasks are tasks not assigned to shared projects
      filteredTasks = tasks.filter(task => {
        if (!task.project_id) return true;
        const project = projects.find(p => p.id === task.project_id);
        return project ? !project.is_shared : true;
      });
    } else if (type === 'shared') {
      // Shared tasks are tasks assigned to shared projects
      filteredTasks = tasks.filter(task => {
        if (!task.project_id) return false;
        const project = projects.find(p => p.id === task.project_id);
        return project ? project.is_shared : false;
      });
    }

    // Apply search and filters
    return filteredTasks
      .filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            task.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
        if (!matchesSearch) return false;
        
        switch (filter) {
          case 'today':
            return task.due_date && new Date(task.due_date).toDateString() === new Date().toDateString();
          case 'overdue':
            return task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';
          case 'completed':
            return task.status === 'done';
          default:
            return true;
        }
      })
      .sort((a, b) => {
        // Sort by priority and due date
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (a.priority !== b.priority) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        if (a.due_date && b.due_date) {
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  };
  const getPriorityIcon = (priority: Priority) => {
    switch (priority) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
    }
  };
  const TaskList = ({
    tasks: taskList
  }: {
    tasks: Task[];
  }) => <div className="space-y-4">
      {taskList.length === 0 ? <Card className="glass-card">
          <CardContent className="text-center py-12">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">
              Nenhuma tarefa encontrada
            </h3>
            <p className="text-muted-foreground mb-4">
              Comece criando sua primeira tarefa para se manter organizado
            </p>
            <Button className="glow-button" onClick={() => setIsFormOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Tarefa
            </Button>
          </CardContent>
        </Card> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {taskList.map(task => {
        const StatusIcon = statusIcons[task.status];
        const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';
        return <Card key={task.id} className={`task-card ${isOverdue ? 'border-red-500/50' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <StatusIcon className={`w-4 h-4 ${task.status === 'done' ? 'text-green-400' : task.status === 'in-progress' ? 'text-blue-400' : 'text-muted-foreground'}`} />
                      <Badge variant="outline" className={priorityColors[task.priority]}>
                        {getPriorityIcon(task.priority)} {task.priority.toUpperCase()}
                      </Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="glass-card border-white/20">
                        <DropdownMenuItem onClick={() => updateTask({ id: task.id, updates: { status: task.status === 'done' ? 'todo' : 'done' } })}>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {task.status === 'done' ? 'Marcar como Pendente' : 'Marcar como Concluída'}
                        </DropdownMenuItem>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem>Duplicar</DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-400"
                          onClick={() => deleteTask(task.id)}
                        >
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardTitle className="text-lg">{task.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}
                  
                  {task.due_date && <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span className={isOverdue ? 'text-red-400' : 'text-muted-foreground'}>
                        {new Date(task.due_date).toLocaleDateString('pt-BR')}
                      </span>
                      {isOverdue && <Badge variant="destructive" className="text-xs">Atrasada</Badge>}
                    </div>}

                  {task.project_id && <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-400">
                      Projeto Compartilhado
                    </Badge>}

                  {task.checklist && task.checklist.length > 0 && <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Checklist ({task.checklist.filter(item => item.completed).length}/{task.checklist.length})
                      </p>
                      <div className="space-y-1 max-h-20 overflow-y-auto">
                        {task.checklist.slice(0, 3).map(item => <div key={item.id} className="flex items-center gap-2 text-xs">
                            <CheckCircle className={`w-3 h-3 ${item.completed ? 'text-green-400' : 'text-muted-foreground'}`} />
                            <span className={item.completed ? 'line-through text-muted-foreground' : ''}>
                              {item.text}
                            </span>
                          </div>)}
                        {task.checklist.length > 3 && <p className="text-xs text-muted-foreground">
                            +{task.checklist.length - 3} itens
                          </p>}
                      </div>
                    </div>}

                  <div className="flex justify-between items-center pt-2">
                    <div className="text-xs text-muted-foreground">
                      Criada em {new Date(task.created_at).toLocaleDateString('pt-BR')}
                    </div>
                    {task.status !== 'done' && <Button 
                        size="sm" 
                        className="glow-button"
                        onClick={() => updateTask({ id: task.id, updates: { status: 'done' } })}
                      >
                        Marcar como Concluída
                      </Button>}
                  </div>
                </CardContent>
              </Card>;
      })}
        </div>}
    </div>;
  return <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Minhas Tarefas
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas tarefas pessoais e compartilhadas
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <TaskForm onSubmit={handleCreateTask} onCancel={() => setIsFormOpen(false)} projects={projects} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar tarefas..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 glass-card border-white/20" />
        </div>
        <div className="flex gap-2">
          {['all', 'today', 'overdue', 'completed'].map(filterOption => <Button key={filterOption} variant={filter === filterOption ? 'default' : 'outline'} size="sm" onClick={() => setFilter(filterOption as any)} className={filter === filterOption ? 'glow-button' : 'neon-border'}>
              {filterOption === 'all' && 'Todas'}
              {filterOption === 'today' && 'Hoje'}
              {filterOption === 'overdue' && 'Atrasadas'}
              {filterOption === 'completed' && 'Concluídas'}
            </Button>)}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 glass-card">
          <TabsTrigger value="all" className="data-[state=active]:glow-button">
            Geral ({tasks.length})
          </TabsTrigger>
          <TabsTrigger value="personal" className="data-[state=active]:glow-button">
            Pessoal ({getFilteredTasks('personal').length})
          </TabsTrigger>
          <TabsTrigger value="shared" className="data-[state=active]:glow-button">
            Compartilhadas ({getFilteredTasks('shared').length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <TaskList tasks={getFilteredTasks('all')} />
        </TabsContent>
        
        <TabsContent value="personal" className="mt-6">
          <TaskList tasks={getFilteredTasks('personal')} />
        </TabsContent>
        
        <TabsContent value="shared" className="mt-6">
          <TaskList tasks={getFilteredTasks('shared')} />
        </TabsContent>
      </Tabs>

      {/* Floating Action Button */}
      <Button className="floating-action animate-pulse-glow" onClick={() => setIsFormOpen(true)}>
        <Plus className="w-6 h-6" />
      </Button>
    </div>;
}