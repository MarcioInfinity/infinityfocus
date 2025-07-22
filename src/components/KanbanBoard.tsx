import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { TaskForm } from './forms/TaskForm';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useGoals } from '@/hooks/useGoals';
import { Task } from '@/types';
import { Plus, Calendar, Clock, User, MoreHorizontal, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface KanbanBoardProps {
  projectId: string;
}

const columns = [
  { id: 'todo', title: 'A Fazer', color: 'bg-blue-500' },
  { id: 'in_progress', title: 'Em Progresso', color: 'bg-yellow-500' },
  { id: 'review', title: 'Revisão', color: 'bg-purple-500' },
  { id: 'done', title: 'Concluído', color: 'bg-green-500' },
];

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const { tasks, updateTask, deleteTask, isLoading } = useTasks(projectId);
  const { projects } = useProjects();
  const { goals } = useGoals();
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [tasksByColumn, setTasksByColumn] = useState<Record<string, Task[]>>({
    todo: [],
    in_progress: [],
    review: [],
    done: [],
  });

  // Organizar tarefas por coluna em tempo real
  useEffect(() => {
    const organized = {
      todo: tasks.filter(task => task.status === 'todo'),
      in_progress: tasks.filter(task => task.status === 'in_progress'),
      review: tasks.filter(task => task.status === 'review'),
      done: tasks.filter(task => task.status === 'done'),
    };
    setTasksByColumn(organized);
  }, [tasks]);

  const handleCreateTask = (taskData: any) => {
    const { createTask } = useTasks(projectId);
    createTask({ ...taskData, project_id: projectId, status: 'todo' });
    setIsTaskFormOpen(false);
  };

  const handleUpdateTask = (taskData: any) => {
    if (editingTask) {
      updateTask({ id: editingTask.id, updates: taskData });
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
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
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

  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <p className="text-muted-foreground">Carregando quadro Kanban...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Quadro Kanban</h2>
        <Dialog open={isTaskFormOpen} onOpenChange={setIsTaskFormOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="glow-button">
              <Plus className="w-4 h-4 mr-1" />
              Nova Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
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

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((column) => (
            <div key={column.id} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${column.color}`} />
                <h3 className="font-semibold">{column.title}</h3>
                <Badge variant="secondary" className="ml-auto">
                  {tasksByColumn[column.id]?.length || 0}
                </Badge>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[200px] space-y-2 p-2 rounded-lg border-2 border-dashed transition-colors ${
                      snapshot.isDraggingOver
                        ? 'border-primary bg-primary/5'
                        : 'border-muted'
                    }`}
                  >
                    {tasksByColumn[column.id]?.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`glass-card cursor-move transition-all ${
                              snapshot.isDragging ? 'rotate-2 shadow-lg' : ''
                            }`}
                          >
                            <CardHeader className="pb-2">
                              <div className="flex items-start justify-between">
                                <CardTitle className="text-sm font-medium line-clamp-2">
                                  {task.title}
                                </CardTitle>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-6 w-6 p-0">
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
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-400">
                                          <Trash2 className="mr-2 h-3 w-3" />
                                          Excluir
                                        </DropdownMenuItem>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Esta ação não pode ser desfeita. Isso excluirá permanentemente esta tarefa.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => handleDeleteTask(task.id)} className="bg-red-500 hover:bg-red-600">
                                            Excluir
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0 space-y-2">
                              {task.description && (
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {task.description}
                                </p>
                              )}
                              
                              <div className="flex items-center justify-between">
                                <Badge 
                                  variant="secondary" 
                                  className={`text-xs ${getPriorityColor(task.priority)} text-white`}
                                >
                                  {getPriorityLabel(task.priority)}
                                </Badge>
                                
                                {task.due_date && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Calendar className="w-3 h-3" />
                                    {format(new Date(task.due_date), 'dd/MM', { locale: ptBR })}
                                  </div>
                                )}
                              </div>

                              {task.start_time && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="w-3 h-3" />
                                  {task.start_time}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}

                    {/* Botão para adicionar tarefa diretamente na coluna */}
                    <Dialog open={isTaskFormOpen} onOpenChange={setIsTaskFormOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          className="w-full h-10 border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5"
                          onClick={() => setEditingTask(null)}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Adicionar tarefa
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
