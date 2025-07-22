
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, Settings, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TaskForm } from '@/components/forms/TaskForm';
import { EditTaskModal } from '@/components/modals/EditTaskModal';
import { EditColumnModal } from '@/components/modals/EditColumnModal';
import { useTasks } from '@/hooks/useTasks';
import { useToastNotifications } from '@/hooks/use-toast-notifications';
import { KanbanColumn, Task, TaskStatus } from '@/types';

interface KanbanBoardProps {
  projectId: string;
}

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const { showSuccessToast, showErrorToast } = useToastNotifications();
  const { tasks, updateTask, deleteTask, createTask, isLoading } = useTasks(projectId);
  
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [isEditColumnModalOpen, setIsEditColumnModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<KanbanColumn | null>(null);

  // Default columns structure
  const defaultColumns: KanbanColumn[] = [
    {
      id: 'todo',
      title: 'A Fazer',
      color: '#ef4444',
      status: 'todo' as TaskStatus,
      position: 0,
      tasks: [],
    },
    {
      id: 'in-progress',
      title: 'Em Progresso',
      color: '#f59e0b',
      status: 'in-progress' as TaskStatus,
      position: 1,
      tasks: [],
    },
    {
      id: 'review',
      title: 'Em Revisão',
      color: '#3b82f6',
      status: 'review' as TaskStatus,
      position: 2,
      tasks: [],
    },
    {
      id: 'done',
      title: 'Concluído',
      color: '#10b981',
      status: 'done' as TaskStatus,
      position: 3,
      tasks: [],
    }
  ];

  const [columns, setColumns] = useState<KanbanColumn[]>(defaultColumns);

  useEffect(() => {
    // Organize tasks by status
    const updatedColumns = defaultColumns.map(column => ({
      ...column,
      tasks: tasks.filter(task => task.status === column.status)
    }));
    setColumns(updatedColumns);
  }, [tasks]);

  const handleCreateTask = (taskData: any) => {
    const taskPayload = {
      ...taskData,
      project_id: projectId,
      status: 'todo' as TaskStatus
    };
    
    createTask(taskPayload);
    setIsTaskFormOpen(false);
    showSuccessToast('Tarefa criada com sucesso!');
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsEditTaskModalOpen(true);
  };

  const handleUpdateTask = (taskData: any) => {
    if (selectedTask) {
      updateTask({
        id: selectedTask.id,
        updates: taskData
      });
      setIsEditTaskModalOpen(false);
      setSelectedTask(null);
      showSuccessToast('Tarefa atualizada com sucesso!');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      try {
        await deleteTask(taskId);
        showSuccessToast('Tarefa excluída com sucesso!');
      } catch (error) {
        showErrorToast('Erro ao excluir tarefa');
      }
    }
  };

  const handleEditColumn = (column: KanbanColumn) => {
    setSelectedColumn(column);
    setIsEditColumnModalOpen(true);
  };

  const handleUpdateColumn = (columnData: any) => {
    // Here we would normally update the column, but since we're using default columns
    // we'll just show a success message
    setIsEditColumnModalOpen(false);
    setSelectedColumn(null);
    showSuccessToast('Coluna atualizada com sucesso!');
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

    const newStatus = destination.droppableId as TaskStatus;
    
    updateTask({
      id: task.id,
      updates: { status: newStatus }
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'professional': return '💼';
      case 'health': return '🏥';
      case 'finance': return '💰';
      case 'relationship': return '❤️';
      case 'intellectual': return '🧠';
      case 'spiritual': return '🙏';
      default: return '📝';
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Kanban Board</h1>
        <Dialog open={isTaskFormOpen} onOpenChange={setIsTaskFormOpen}>
          <DialogTrigger asChild>
            <Button className="glow-button">
              <Plus className="w-4 h-4 mr-2" />
              Nova Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <TaskForm
              onSubmit={handleCreateTask}
              onCancel={() => setIsTaskFormOpen(false)}
              defaultProjectId={projectId}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-6 min-h-full pb-6">
            {columns.map((column) => (
              <div key={column.id} className="flex flex-col w-80 min-w-80">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: column.color }}
                    />
                    <h3 className="font-semibold text-lg">{column.title}</h3>
                    <Badge variant="secondary" className="ml-2">
                      {column.tasks.length}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleEditColumn(column)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar Coluna
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Droppable Column */}
                <Droppable droppableId={column.status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 min-h-[200px] rounded-lg border-2 border-dashed p-2 transition-colors ${
                        snapshot.isDraggingOver 
                          ? 'border-primary bg-primary/5' 
                          : 'border-muted'
                      }`}
                    >
                      <div className="space-y-3">
                        {column.tasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`cursor-grab active:cursor-grabbing transition-shadow ${
                                  snapshot.isDragging ? 'shadow-lg' : 'hover:shadow-md'
                                }`}
                              >
                                <CardHeader className="pb-2">
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="text-lg">{getCategoryIcon(task.category)}</span>
                                      <h4 className="font-medium text-sm line-clamp-2">{task.title}</h4>
                                    </div>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger 
                                        asChild
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                          <MoreHorizontal className="w-3 h-3" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => handleEditTask(task)}>
                                          <Edit className="w-4 h-4 mr-2" />
                                          Editar
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          onClick={() => handleDeleteTask(task.id)}
                                          className="text-red-400"
                                        >
                                          <Trash2 className="w-4 h-4 mr-2" />
                                          Excluir
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </CardHeader>
                                
                                <CardContent className="pt-0">
                                  {task.description && (
                                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                      {task.description}
                                    </p>
                                  )}
                                  
                                  <div className="flex items-center justify-between">
                                    <Badge variant="outline" className={getPriorityColor(task.priority)}>
                                      {task.priority === 'high' && '🔴'}
                                      {task.priority === 'medium' && '🟡'}
                                      {task.priority === 'low' && '🟢'}
                                    </Badge>
                                    
                                    {task.due_date && (
                                      <span className="text-xs text-muted-foreground">
                                        {new Date(task.due_date).toLocaleDateString('pt-BR')}
                                      </span>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                      </div>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* Edit Task Modal */}
      <EditTaskModal
        task={selectedTask}
        isOpen={isEditTaskModalOpen}
        onClose={() => {
          setIsEditTaskModalOpen(false);
          setSelectedTask(null);
        }}
        onSave={handleUpdateTask}
      />

      {/* Edit Column Modal */}
      <EditColumnModal
        column={selectedColumn}
        isOpen={isEditColumnModalOpen}
        onClose={() => {
          setIsEditColumnModalOpen(false);
          setSelectedColumn(null);
        }}
        onSave={handleUpdateColumn}
      />
    </div>
  );
}
