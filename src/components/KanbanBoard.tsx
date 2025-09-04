import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { TaskForm } from './forms/TaskForm';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useGoals } from '@/hooks/useGoals';
import { Task } from '@/types';
import { Plus, Calendar, Clock, MoreHorizontal, Edit2, Trash2, Settings, GripVertical } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface KanbanBoardProps {
  projectId: string;
}

interface Column {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
}

const defaultColumns = [
  { id: 'todo', title: 'A Fazer', color: 'bg-blue-500' },
  { id: 'in-progress', title: 'Em Progresso', color: 'bg-yellow-500' },
  { id: 'review', title: 'Revisão', color: 'bg-purple-500' },
  { id: 'done', title: 'Concluído', color: 'bg-green-500' },
];

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const { tasks, createTask, updateTask, deleteTask, isLoading } = useTasks(projectId);
  const { projects } = useProjects();
  const { goals } = useGoals();
  const [columns, setColumns] = useState<Column[]>([]);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedColumnForNewTask, setSelectedColumnForNewTask] = useState<string>('todo');
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  // Organizar tarefas por coluna em tempo real
  useEffect(() => {
    const organized = defaultColumns.map(col => ({
      ...col,
      tasks: tasks.filter(task => task.status === col.id)
    }));
    setColumns(organized);
  }, [tasks]);

  const handleCreateTask = (taskData: any) => {
    const taskWithProjectAndStatus = {
      ...taskData,
      project_id: projectId,
      status: selectedColumnForNewTask,
      created_by: taskData.created_by || taskData.user_id,
      user_id: taskData.user_id || taskData.created_by,
    };
    
    createTask(taskWithProjectAndStatus);
    setIsTaskFormOpen(false);
    setEditingTask(null);
  };

  const handleUpdateTask = (taskData: any) => {
    if (editingTask) {
      updateTask({ 
        id: editingTask.id, 
        updates: taskData 
      });
      setEditingTask(null);
      setIsTaskFormOpen(false);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const task = tasks.find(t => t.id === draggableId);
    if (!task) return;

    // Atualizar o status da tarefa
    updateTask({
      id: task.id,
      updates: { status: destination.droppableId as Task['status'] }
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500 text-white border-red-500/50';
      case 'medium': return 'bg-yellow-500 text-white border-yellow-500/50';
      case 'low': return 'bg-green-500 text-white border-green-500/50';
      default: return 'bg-gray-500 text-white border-gray-500/50';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return 'Indefinida';
    }
  };

  const handleAddColumn = () => {
    if (!newColumnTitle.trim()) return;
    
    const newColumn = {
      id: `custom-${Date.now()}`,
      title: newColumnTitle,
      color: 'bg-indigo-500',
      tasks: []
    };
    
    setColumns([...columns, newColumn]);
    setNewColumnTitle('');
    setIsAddingColumn(false);
    toast.success('Nova coluna adicionada!');
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground ml-3">Carregando quadro Kanban...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Quadro Kanban
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Organize suas tarefas de forma visual e eficiente
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingColumn(true)}
            className="glass-card hover:scale-105 transition-transform"
          >
            <Plus className="w-4 h-4 mr-1" />
            Nova Coluna
          </Button>
          <Dialog open={isTaskFormOpen} onOpenChange={setIsTaskFormOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="glow-button hover:scale-105 transition-transform">
                <Plus className="w-4 h-4 mr-1" />
                Nova Tarefa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogTitle>
                {editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
              </DialogTitle>
              <TaskForm
                onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
                onCancel={() => {
                  setIsTaskFormOpen(false);
                  setEditingTask(null);
                }}
                initialData={editingTask}
                projects={projects}
                goals={goals}
                defaultProjectId={projectId}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Add Column Dialog */}
      <Dialog open={isAddingColumn} onOpenChange={setIsAddingColumn}>
        <DialogContent className="max-w-md">
          <DialogTitle>Adicionar Nova Coluna</DialogTitle>
          <div className="space-y-4">
            <Input
              placeholder="Nome da coluna"
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddColumn()}
              className="glass-card"
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsAddingColumn(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddColumn} disabled={!newColumnTitle.trim()}>
                Adicionar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-4 min-h-[600px]">
          {columns.map((column) => (
            <div key={column.id} className="flex-shrink-0 w-80 space-y-4">
              {/* Column Header */}
              <div className="glass-card p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${column.color} shadow-lg`} />
                    <h3 className="font-semibold text-lg">{column.title}</h3>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      {column.tasks.length}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        setSelectedColumnForNewTask(column.id);
                        setIsTaskFormOpen(true);
                      }}>
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar Tarefa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Column Content */}
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[500px] space-y-3 p-4 rounded-lg border-2 border-dashed transition-all duration-300 ${
                      snapshot.isDraggingOver
                        ? 'border-primary bg-primary/5 shadow-lg'
                        : 'border-muted-foreground/25 bg-muted/20'
                    }`}
                  >
                    {column.tasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`glass-card cursor-move transition-all duration-300 hover:shadow-xl group ${
                              snapshot.isDragging ? 'rotate-3 shadow-2xl scale-105 z-50' : 'hover:scale-102'
                            }`}
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-2 flex-1">
                                  <div
                                    {...provided.dragHandleProps}
                                    className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
                                  >
                                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                  <CardTitle className="text-sm font-medium line-clamp-2 flex-1">
                                    {task.title}
                                  </CardTitle>
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <MoreHorizontal className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => {
                                      setEditingTask(task);
                                      setIsTaskFormOpen(true);
                                    }}>
                                      <Edit2 className="mr-2 h-3 w-3" />
                                      Editar
                                    </DropdownMenuItem>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                          <Trash2 className="mr-2 h-3 w-3" />
                                          Excluir
                                        </DropdownMenuItem>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Tem certeza que deseja excluir a tarefa "{task.title}"? Esta ação não pode ser desfeita.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                          <AlertDialogAction 
                                            onClick={() => handleDeleteTask(task.id)} 
                                            className="bg-destructive hover:bg-destructive/90"
                                          >
                                            Excluir
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0 space-y-3">
                              {task.description && (
                                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                  {task.description}
                                </p>
                              )}
                              
                              {/* Priority Badge */}
                              <div className="flex items-center justify-between">
                                <Badge 
                                  variant="secondary" 
                                  className={`text-xs font-medium ${getPriorityColor(task.priority)}`}
                                >
                                  {getPriorityLabel(task.priority)}
                                </Badge>
                                
                                {task.due_date && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                                    <Calendar className="w-3 h-3" />
                                    {format(new Date(task.due_date), 'dd/MM', { locale: ptBR })}
                                  </div>
                                )}
                              </div>

                              {/* Time and Repeat Info */}
                              <div className="flex flex-wrap gap-2">
                                {task.start_time && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                                    <Clock className="w-3 h-3" />
                                    {task.start_time}
                                  </div>
                                )}

                                {task.repeat_enabled && (
                                  <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/30">
                                    🔄 {task.repeat_type === 'daily' ? 'Diário' : 
                                        task.repeat_type === 'weekly' ? 'Semanal' :
                                        task.repeat_type === 'monthly' ? 'Mensal' : 'Personalizado'}
                                  </Badge>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}

                    {/* Add Task Button */}
                    <Button
                      variant="ghost"
                      className="w-full h-16 border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 group"
                      onClick={() => {
                        setSelectedColumnForNewTask(column.id);
                        setEditingTask(null);
                        setIsTaskFormOpen(true);
                      }}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="text-xs">Adicionar tarefa</span>
                      </div>
                    </Button>
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Mobile Responsive Message */}
      <div className="md:hidden bg-muted/50 p-4 rounded-lg border border-muted">
        <p className="text-sm text-muted-foreground text-center">
          💡 Dica: Deslize horizontalmente para navegar entre as colunas no mobile
        </p>
      </div>
    </div>
  );
}
