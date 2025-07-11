
import { useState } from 'react';
import { 
  Plus, 
  MoreHorizontal, 
  Calendar, 
  User, 
  Flag,
  Clock,
  CheckCircle,
  AlertCircle,
  UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { TaskForm } from './forms/TaskForm';
import { InviteModal } from './modals/InviteModal';
import { EditColumnModal } from './modals/EditColumnModal';
import { Task, KanbanColumn, Priority } from '@/types';

const mockColumns: KanbanColumn[] = [
  {
    id: '1',
    title: 'A Fazer',
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

interface KanbanBoardProps {
  projectId: string;
  projectName: string;
}

export function KanbanBoard({ projectId, projectName }: KanbanBoardProps) {
  const [columns, setColumns] = useState<KanbanColumn[]>(mockColumns);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [draggedColumn, setDraggedColumn] = useState<KanbanColumn | null>(null);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<KanbanColumn | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleColumnDragStart = (column: KanbanColumn) => {
    setDraggedColumn(column);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (columnId: string, status: Task['status']) => {
    if (!draggedTask) return;

    setColumns(prev => prev.map(column => ({
      ...column,
      tasks: column.id === columnId 
        ? [...column.tasks.filter(t => t.id !== draggedTask.id), { ...draggedTask, status }]
        : column.tasks.filter(t => t.id !== draggedTask.id)
    })));

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

      // Remove the dragged column
      const [removed] = newColumns.splice(draggedIndex, 1);
      // Insert it at the target position
      newColumns.splice(targetIndex, 0, removed);

      // Update positions
      return newColumns.map((col, index) => ({
        ...col,
        position: index
      }));
    });

    setDraggedColumn(null);
  };

  const handleCreateTask = (taskData: any) => {
    const newTask: Task = {
      id: Date.now().toString(),
      ...taskData,
      status: selectedColumn ? columns.find(col => col.id === selectedColumn)?.status || 'todo' : 'todo',
      project_id: projectId,
      created_by: 'current-user-id',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      notifications: []
    };

    if (selectedColumn) {
      setColumns(prev => prev.map(column => 
        column.id === selectedColumn 
          ? { ...column, tasks: [...column.tasks, newTask] }
          : column
      ));
    }

    setIsTaskFormOpen(false);
    setSelectedColumn(null);
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {projectName}
          </h1>
          <p className="text-muted-foreground mt-1">
            Quadro Kanban - Gerencie as tarefas do projeto
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="glow-button" onClick={() => setIsTaskFormOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Tarefa
          </Button>
          <Button 
            variant="outline" 
            className="neon-border"
            onClick={() => setIsInviteModalOpen(true)}
          >
            <User className="w-4 h-4 mr-2" />
            Convidar Membro
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-6 overflow-x-auto pb-6">
        {columns.map((column) => {
          const StatusIcon = statusIcons[column.status];
          
          return (
            <div
              key={column.id}
              className="kanban-column min-w-[280px] flex-shrink-0"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.id, column.status)}
            >
              <div className="flex items-center justify-between mb-4">
                <div 
                  className="flex items-center gap-2 cursor-move"
                  draggable
                  onDragStart={() => handleColumnDragStart(column)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleColumnDrop(column.id)}
                >
                  <StatusIcon className="w-5 h-5" style={{ color: column.color }} />
                  <h3 className="font-semibold text-lg">{column.title}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {column.tasks.length}
                  </Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
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

              <div className="space-y-3">
                {column.tasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <StatusIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma tarefa</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-2 text-xs"
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
                        className={`task-card cursor-move ${isOverdue ? 'border-red-500/50' : ''}`}
                        draggable
                        onDragStart={() => handleDragStart(task)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <Badge variant="outline" className={priorityColors[task.priority]}>
                              {getPriorityIcon(task.priority)} {task.priority.toUpperCase()}
                            </Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="glass-card border-white/20">
                                <DropdownMenuItem>Editar</DropdownMenuItem>
                                <DropdownMenuItem>Duplicar</DropdownMenuItem>
                                <DropdownMenuItem>Mover para...</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-400">Excluir</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <CardTitle className="text-base">{task.title}</CardTitle>
                        </CardHeader>
                        
                        <CardContent className="space-y-3">
                          {task.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {task.description}
                            </p>
                          )}

                          {task.due_date && (
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4" />
                              <span className={isOverdue ? 'text-red-400' : 'text-muted-foreground'}>
                                {new Date(task.due_date).toLocaleDateString('pt-BR')}
                              </span>
                              {isOverdue && (
                                <Badge variant="destructive" className="text-xs">
                                  Atrasada
                                </Badge>
                              )}
                            </div>
                          )}

                          {task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {task.tags.slice(0, 3).map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {task.tags.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{task.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}

                          {task.assigned_to && (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarImage src="" />
                                  <AvatarFallback className="text-xs bg-primary/20">
                                    {task.assigned_to.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-muted-foreground">
                                  Atribuída
                                </span>
                              </div>
                              {task.notifications.length > 0 && (
                                <Badge variant="outline" className="text-xs">
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

      {/* Floating Action Button */}
      <Button className="floating-action animate-glow" onClick={() => setIsTaskFormOpen(true)}>
        <Plus className="w-6 h-6" />
      </Button>

      {/* Modals */}
      <Dialog open={isTaskFormOpen} onOpenChange={setIsTaskFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <TaskForm
            onSubmit={handleCreateTask}
            onCancel={() => {
              setIsTaskFormOpen(false);
              setSelectedColumn(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        projectName={projectName}
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
