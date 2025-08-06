
import { useState } from 'react';
import { Plus, Calendar, Tag, User, Trash2, Edit3, CheckCircle2, Clock, AlertCircle, List, Grid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useGoals } from '@/hooks/useGoals';
import { EditTaskModal } from './modals/EditTaskModal';
import { TaskFormWithChecklist } from './forms/TaskFormWithChecklist';

const priorityColors = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  high: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
};

const statusColors = {
  todo: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
  'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  review: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
  done: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
};

export function TaskManager() {
  const { tasks, createTask, updateTask, deleteTask, isLoading } = useTasks();
  const { projects } = useProjects();
  const { goals } = useGoals();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const filteredTasks = tasks.filter(task => {
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    return true;
  });

  const handleUpdateTask = (id: string, updates: any) => {
    updateTask({ id, updates });
  };

  const handleDeleteTask = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      deleteTask(id);
    }
  };

  const handleOpenEditModal = (task: any) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Tarefas
          </h1>
          <p className="text-muted-foreground mt-1">Carregando tarefas...</p>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
          <div className="h-32 bg-muted rounded mb-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Tarefas
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas tarefas e acompanhe o progresso
          </p>
        </div>
        <Button className="glow-button" onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Tarefa
        </Button>
      </div>

      {/* Filtros e Visualização */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40 glass-card border-white/20">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="todo">A fazer</SelectItem>
                <SelectItem value="in-progress">Em progresso</SelectItem>
                <SelectItem value="review">Revisão</SelectItem>
                <SelectItem value="done">Concluída</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-40 glass-card border-white/20">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Create Task Form */}
      {showCreateForm && (
        <TaskFormWithChecklist onClose={() => setShowCreateForm(false)} />
      )}

      {/* Tasks List/Grid */}
      <div className="space-y-4">
        {!filteredTasks || filteredTasks.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="text-center py-12">
              <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma tarefa encontrada</h3>
              <p className="text-muted-foreground mb-4">
                Crie sua primeira tarefa para começar a organizar seu trabalho
              </p>
              <Button className="glow-button" onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Tarefa
              </Button>
            </CardContent>
          </Card>
        ) : viewMode === 'list' ? (
          // Lista com checkboxes
          <Card className="glass-card">
            <CardContent className="p-0">
              <div className="space-y-0">
                {filteredTasks.map((task, index) => (
                  <div key={task.id} className={`flex items-center gap-4 p-4 ${index !== filteredTasks.length - 1 ? 'border-b border-white/10' : ''}`}>
                    <Checkbox
                      checked={task.status === 'done'}
                      onCheckedChange={(checked) => 
                        handleUpdateTask(task.id, { status: checked ? 'done' : 'todo' })
                      }
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className={`font-medium ${task.status === 'done' ? 'line-through opacity-60' : ''}`}>
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={priorityColors[task.priority]}>
                              {task.priority === 'low' ? 'Baixa' : task.priority === 'medium' ? 'Média' : 'Alta'}
                            </Badge>
                            <Badge className={statusColors[task.status]}>
                              {task.status === 'todo' ? 'A fazer' : 
                               task.status === 'in-progress' ? 'Em progresso' : 
                               task.status === 'review' ? 'Revisão' : 'Concluída'}
                            </Badge>
                            {task.due_date && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                {new Date(task.due_date).toLocaleDateString('pt-BR')}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-1 flex-shrink-0">
                          <Button variant="ghost" size="sm" onClick={() => handleOpenEditModal(task)}>
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteTask(task.id)} 
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          // Grid view mantido
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map(task => (
              <Card key={task.id} className="glass-card">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-lg">{task.title}</CardTitle>
                      <div className="flex gap-2">
                        <Badge className={priorityColors[task.priority]}>
                          {task.priority === 'low' ? 'Baixa' : task.priority === 'medium' ? 'Média' : 'Alta'}
                        </Badge>
                        <Badge className={statusColors[task.status]}>
                          {task.status === 'todo' ? 'A fazer' : 
                           task.status === 'in-progress' ? 'Em progresso' : 
                           task.status === 'review' ? 'Revisão' : 'Concluída'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenEditModal(task)}>
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteTask(task.id)} 
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {task.description && (
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {task.due_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(task.due_date).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                    {task.notifications_enabled && (
                      <div className="flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Notificações
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateTask(task.id, { 
                        status: task.status === 'done' ? 'todo' : 'done' 
                      })}
                      className="flex-1"
                    >
                      {task.status === 'done' ? (
                        <>
                          <Clock className="w-3 h-3 mr-1" />
                          Reabrir
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Concluir
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Criada em {new Date(task.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <Button 
        className="floating-action animate-glow" 
        onClick={() => setShowCreateForm(true)}
      >
        <Plus className="w-6 h-6" />
      </Button>

      {/* Edit Task Modal */}
      <EditTaskModal
        taskId={editingTask?.id || null}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
}
