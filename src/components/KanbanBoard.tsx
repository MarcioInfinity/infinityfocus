import { useState, useEffect } from 'react';
import { 
  Plus, 
  MoreHorizontal, 
  Calendar, 
  User, 
  Flag,
  Clock,
  CheckCircle,
  AlertCircle,
  UserPlus,
  Edit2,
  Check,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { TaskFormImproved } from './forms/TaskFormImproved';
import { InviteModal } from './modals/InviteModal';
import { EditColumnModal } from './modals/EditColumnModal';
import { Task, KanbanColumn, Priority } from '@/types';
import { useToastNotifications } from '@/hooks/use-toast-notifications';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useGoals } from '@/hooks/useGoals';
import { supabase } from '@/integrations/supabase/client';

const mockColumns: KanbanColumn[] = [
  {
    id: '1',
    title: 'Nova',
    status: 'todo',
    color: '#64748b',
    tasks: [],
    position: 0
  },
  {
    id: '2',
    title: 'Em Progresso',
    status: 'in-progress',
    color: '#3b82f6',
    tasks: [],
    position: 1
  },
  {
    id: '3',
    title: 'Em Revisão',
    status: 'review',
    color: '#f59e0b',
    tasks: [],
    position: 2
  },
  {
    id: '4',
    title: 'Concluído',
    status: 'done',
    color: '#10b981',
    tasks: [],
    position: 3
  }
];

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

interface KanbanBoardImprovedProps {
  projectId: string;
}

export function KanbanBoardImproved({ projectId }: KanbanBoardImprovedProps) {
  const { tasks, updateTask, createTask } = useTasks();
  const { projects } = useProjects();
  const { goals } = useGoals();
  const [columns, setColumns] = useState<KanbanColumn[]>(mockColumns);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [draggedColumn, setDraggedColumn] = useState<KanbanColumn | null>(null);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<KanbanColumn | null>(null);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const { showSuccessToast, showErrorToast } = useToastNotifications();

  // Load tasks from the project into columns
  useEffect(() => {
    const projectTasks = tasks.filter(task => task.project_id === projectId);
    
    setColumns(prev => prev.map(column => ({
      ...column,
      tasks: projectTasks.filter(task => task.status === column.status)
    })));
  }, [tasks, projectId]);

  // Realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('kanban-tasks')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'tasks',
        filter: `project_id=eq.${projectId}`
      }, () => {
        // Refresh task data
        window.location.reload();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  const handleTaskStatusChange = async (taskId: string, completed: boolean) => {
    try {
      await updateTask({ 
        id: taskId, 
        updates: { status: completed ? 'done' : 'todo' } 
      });
      showSuccessToast(completed ? 'Tarefa concluída!' : 'Tarefa reaberta!');
    } catch (error) {
      console.error('Error updating task status:', error);
      showErrorToast('Erro ao atualizar status da tarefa');
    }
  };

  const handleStartEdit = (taskId: string, currentTitle: string) => {
    setEditingTask(taskId);
    setEditValue(currentTitle);
  };

  const handleSaveEdit = async (taskId: string) => {
    if (!editValue.trim()) return;
    
    try {
      await updateTask({ 
        id: taskId, 
        updates: { title: editValue.trim() } 
      });
      showSuccessToast('Título atualizado!');
      handleCancelEdit();
    } catch (error) {
      console.error('Error updating task:', error);
      showErrorToast('Erro ao atualizar tarefa');
    }
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setEditValue('');
  };

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleColumnDragStart = (column: KanbanColumn) => {
    setDraggedColumn(column);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (columnId: string, status: Task['status']) => {
    if (!draggedTask) return;

    try {
      await updateTask({ 
        id: draggedTask.id, 
        updates: { status } 
      });
      showSuccessToast('Tarefa movida com sucesso!');
    } catch (error) {
      console.error('Error moving task:', error);
      showErrorToast('Erro ao mover tarefa');
    }

    setDraggedTask(null);
  };

  const handleColumnDrop = (targetColumnId: string) => {
    if (!draggedColumn) return;

    const targetColumn = columns.find(col => col.id === targetColumnId);
    if (!targetColumn) return;

    setColumns(prev => {
      const newColumns = [...prev];
      const draggedIndex = newColumns.findIndex(col => col.id === draggedColumn.id);
      const targetIndex = newColumns.findIndex(col => col.id === targetColumnId);

      const [removed] = newColumns.splice(draggedIndex, 1);
      newColumns.splice(targetIndex, 0, removed);

      return newColumns.map((col, index) => ({
        ...col,
        position: index
      }));
    });

    setDraggedColumn(null);
  };

  // CORREÇÃO #3: Implementar funcionalidade do botão de criar tarefa no Kanban
  const handleCreateTask = async (taskData: any) => {
    try {
      // Garantir que a tarefa seja criada no projeto atual
      const taskWithProject = {
        ...taskData,
        project_id: projectId,
        assign_to_project: true
      };

      await createTask(taskWithProject);
      showSuccessToast('Tarefa criada com sucesso no projeto!');
      setIsTaskFormOpen(false);
      setSelectedColumn(null);
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      showErrorToast('Erro ao criar tarefa. Tente novamente.');
    }
  };

  const handleUpdateColumn = (updatedColumn: KanbanColumn) => {
    setColumns(prev => prev.map(col => 
      col.id === updatedColumn.id ? updatedColumn : col
    ));
  };

  const handleDeleteColumn = (columnId: string) => {
    setColumns(prev => prev.filter(col => col.id !== columnId));
  };

  const getPriorityIcon = (priority: Priority) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
    }
  };

  const openTaskForm = (columnId: string) => {
    setSelectedColumn(columnId);
    setIsTaskFormOpen(true);
  };

  const openInviteModal = () => {
    setIsInviteModalOpen(true);
  };

  return (
    <div className="space-y-4 animate-fade-in h-full">
      {/* Compact Header */}
      <div className="flex items-center justify-between gap-4 px-2">
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Kanban
        </h1>
        <div className="flex gap-2">
          {/* CORREÇÃO #3: Botão de criar tarefa funcional */}
          <Dialog open={isTaskFormOpen} onOpenChange={setIsTaskFormOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="glow-button">
                <Plus className="w-4 h-4 mr-1" />
                Tarefa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <TaskFormImproved
                onSubmit={handleCreateTask}
                onCancel={() => {
                  setIsTaskFormOpen(false);
                  setSelectedColumn(null);
                }}
                projects={projects}
                goals={goals}
                defaultProjectId={projectId}
              />
            </DialogContent>
          </Dialog>
          
          <Button 
            size="sm"
            variant="outline" 
            className="neon-border"
            onClick={openInviteModal}
          >
            <User className="w-4 h-4 mr-1" />
            Convite
          </Button>
        </div>
      </div>

      {/* Enhanced Kanban Board with darker background */}
      <div className="kanban-container">
        <div className="kanban-scroll-wrapper">
          <div className="flex gap-3 pb-4 min-w-max bg-black/30 backdrop-blur-sm rounded-lg p-4">
            {columns.map((column) => {
              const StatusIcon = statusIcons[column.status];
              
              return (
                <div
                  key={column.id}
                  className="kanban-column min-w-[200px] max-w-[200px] flex-shrink-0 bg-black/20 backdrop-blur-sm rounded-lg p-3"
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(column.id, column.status)}
                >
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div 
                      className="flex items-center gap-2 cursor-move"
                      draggable
                      onDragStart={() => handleColumnDragStart(column)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleColumnDrop(column.id)}
                    >
                      <StatusIcon className="w-4 h-4" style={{ color: column.color }} />
                      <h3 className="font-semibold text-sm">{column.title}</h3>
                      <Badge variant="secondary" className="text-xs h-5">
                        {column.tasks.length}
                      </Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <MoreHorizontal className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="glass-card border-white/20">
                        <DropdownMenuItem onClick={() => openTaskForm(column.id)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Adicionar Tarefa
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditingColumn(column)}>
                          Editar Coluna
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-400"
                          onClick={() => handleDeleteColumn(column.id)}
                        >
                          Excluir Coluna
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-2 kanban-tasks-container">
                    {column.tasks.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground">
                        <StatusIcon className="w-6 h-6 mx-auto mb-2 opacity-50" />
                        <p className="text-xs mb-2">Nenhuma tarefa</p>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs h-7"
                          onClick={() => openTaskForm(column.id)}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Adicionar
                        </Button>
                      </div>
                    ) : (
                      column.tasks.map((task) => {
                        const isOverdue = task.due_date && 
                          new Date(task.due_date) < new Date() && 
                          task.status !== 'done';

                        return (
                          <Card
                            key={task.id}
                            className={`task-card cursor-move hover:scale-105 transition-transform bg-black/40 backdrop-blur-sm ${isOverdue ? 'border-red-500/50' : ''}`}
                            draggable
                            onDragStart={() => handleDragStart(task)}
                          >
                            <CardHeader className="pb-2 p-3">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    checked={task.status === 'done'}
                                    onCheckedChange={(checked) => handleTaskStatusChange(task.id, checked as boolean)}
                                    className="shrink-0 h-4 w-4"
                                  />
                                  <Badge variant="outline" className={`${priorityColors[task.priority]} text-xs h-5`}>
                                    {getPriorityIcon(task.priority)}
                                  </Badge>
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                      <MoreHorizontal className="w-3 h-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent className="glass-card border-white/20">
                                    <DropdownMenuItem onClick={() => handleStartEdit(task.id, task.title)}>
                                      <Edit2 className="w-4 h-4 mr-2" />
                                      Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>Duplicar</DropdownMenuItem>
                                    <DropdownMenuItem>Mover para...</DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-400">Excluir</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              
                              {editingTask === task.id ? (
                                <div className="flex items-center gap-2">
                                  <Input
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className="h-7 text-sm"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSaveEdit(task.id);
                                      if (e.key === 'Escape') handleCancelEdit();
                                    }}
                                    autoFocus
                                  />
                                  <Button size="sm" variant="ghost" onClick={() => handleSaveEdit(task.id)} className="h-7 w-7 p-0">
                                    <Check className="w-3 h-3" />
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={handleCancelEdit} className="h-7 w-7 p-0">
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              ) : (
                                <CardTitle className={`text-sm ${task.status === 'done' ? 'line-through opacity-60' : ''}`}>
                                  {task.title}
                                </CardTitle>
                              )}
                            </CardHeader>
                            
                            <CardContent className="space-y-2 p-3 pt-0">
                              {task.description && (
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {task.description}
                                </p>
                              )}

                              {task.due_date && (
                                <div className="flex items-center gap-2 text-xs">
                                  <Calendar className="w-3 h-3" />
                                  <span className={isOverdue ? 'text-red-400' : 'text-muted-foreground'}>
                                    {new Date(task.due_date).toLocaleDateString('pt-BR')}
                                  </span>
                                  {isOverdue && (
                                    <Badge variant="destructive" className="text-xs h-4">
                                      Atrasada
                                    </Badge>
                                  )}
                                </div>
                              )}

                              {task.tags && task.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {task.tags.slice(0, 2).map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs h-4">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {task.tags.length > 2 && (
                                    <Badge variant="secondary" className="text-xs h-4">
                                      +{task.tags.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              )}

                              {task.assigned_to && (
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Avatar className="w-5 h-5">
                                      <AvatarImage src="" />
                                      <AvatarFallback className="text-xs bg-primary/20">
                                        {task.assigned_to.charAt(0).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs text-muted-foreground">
                                      Atribuída
                                    </span>
                                  </div>
                                  {task.notifications && task.notifications.length > 0 && (
                                    <Badge variant="outline" className="text-xs h-4">
                                      🔔 {task.notifications.length}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modals */}
      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        projectId={projectId}
      />

      {editingColumn && (
        <EditColumnModal
          column={editingColumn}
          isOpen={!!editingColumn}
          onClose={() => setEditingColumn(null)}
          onSave={handleUpdateColumn}
          onDelete={handleDeleteColumn}
        />
      )}
    </div>
  );
}

