
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, MoreHorizontal, Edit, Trash2, Settings, Calendar, User, Target } from 'lucide-react';
import { TaskForm } from './forms/TaskForm';
import { EditColumnModal } from './modals/EditColumnModal';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { Task, TaskStatus, KanbanColumn } from '@/types';

const defaultColumns: KanbanColumn[] = [
  { id: 'todo', title: 'A Fazer', color: '#94A3B8', status: 'todo', position: 0, tasks: [] },
  { id: 'in-progress', title: 'Em Progresso', color: '#F59E0B', status: 'in-progress', position: 1, tasks: [] },
  { id: 'review', title: 'Revisão', color: '#8B5CF6', status: 'review', position: 2, tasks: [] },
  { id: 'done', title: 'Concluído', color: '#10B981', status: 'done', position: 3, tasks: [] },
];

export function KanbanBoard() {
  const { projectId } = useParams<{ projectId: string }>();
  const { tasks, updateTask, isLoading } = useTasks();
  const { projects } = useProjects();
  const [columns, setColumns] = useState<KanbanColumn[]>(defaultColumns);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<KanbanColumn | null>(null);
  const [isEditColumnModalOpen, setIsEditColumnModalOpen] = useState(false);

  const currentProject = projects.find(p => p.id === projectId);
  const projectTasks = tasks.filter(task => task.project_id === projectId);

  useEffect(() => {
    const updatedColumns = defaultColumns.map(column => ({
      ...column,
      tasks: projectTasks.filter(task => task.status === column.status)
    }));
    setColumns(updatedColumns);
  }, [projectTasks]);

  const handleCreateTask = (taskData: any) => {
    const { createTask } = useTasks();
    createTask({
      ...taskData,
      project_id: projectId,
      status: 'todo'
    });
    setIsTaskFormOpen(false);
  };

  const handleDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const task = projectTasks.find(t => t.id === draggableId);
    if (!task) return;

    const newStatus = destination.droppableId as TaskStatus;
    
    updateTask({
      id: task.id,
      updates: { status: newStatus }
    });
  };

  const handleEditColumn = (column: KanbanColumn) => {
    setSelectedColumn(column);
    setIsEditColumnModalOpen(true);
  };

  const handleSaveColumn = (columnData: any) => {
    console.log('Save column:', columnData);
    setIsEditColumnModalOpen(false);
  };

  const handleDeleteColumn = (columnId: string) => {
    console.log('Delete column:', columnId);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'professional': return '💼';
      case 'intellectual': return '🧠';
      case 'finance': return '💰';
      case 'social': return '👥';
      case 'relationship': return '❤️';
      case 'family': return '👨‍👩‍👧‍👦';
      case 'leisure': return '🎮';
      case 'health': return '🏥';
      case 'spiritual': return '🙏';
      case 'emotional': return '😊';
      default: return '📋';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando quadro Kanban...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Kanban - {currentProject?.name || 'Projeto'}
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas tarefas visualmente
          </p>
        </div>
        
        <Dialog open={isTaskFormOpen} onOpenChange={setIsTaskFormOpen}>
          <DialogTrigger asChild>
            <Button className="glow-button">
              <Plus className="w-4 h-4 mr-2" />
              Criar Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <TaskForm 
              onSubmit={handleCreateTask} 
              onCancel={() => setIsTaskFormOpen(false)}
              projectId={projectId}
            />
          </DialogContent>
        </Dialog>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map((column) => (
            <div key={column.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: column.color }}
                  />
                  <h3 className="font-semibold">{column.title}</h3>
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
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleEditColumn(column)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Editar Coluna
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[200px] p-2 rounded-lg transition-colors ${
                      snapshot.isDraggingOver ? 'bg-muted/50' : 'bg-muted/20'
                    }`}
                  >
                    {column.tasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`mb-2 cursor-move transition-shadow ${
                              snapshot.isDragging ? 'shadow-lg' : 'shadow-sm'
                            } hover:shadow-md glass-card`}
                          >
                            <CardHeader className="pb-2">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">
                                    {getCategoryIcon(task.category)}
                                  </span>
                                  <CardTitle className="text-sm font-medium line-clamp-2">
                                    {task.title}
                                  </CardTitle>
                                </div>
                                <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                              </div>
                            </CardHeader>
                            
                            <CardContent className="pt-0">
                              {task.description && (
                                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                  {task.description}
                                </p>
                              )}
                              
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                {task.due_date && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>{new Date(task.due_date).toLocaleDateString('pt-BR')}</span>
                                  </div>
                                )}
                                
                                {task.assigned_to && (
                                  <div className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                  </div>
                                )}
                                
                                {task.goal_id && (
                                  <Target className="w-3 h-3" />
                                )}
                              </div>
                              
                              {task.tags && task.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {task.tags.slice(0, 2).map(tag => (
                                    <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {task.tags.length > 2 && (
                                    <Badge variant="outline" className="text-xs px-1 py-0">
                                      +{task.tags.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      <EditColumnModal
        column={selectedColumn}
        isOpen={isEditColumnModalOpen}
        onClose={() => setIsEditColumnModalOpen(false)}
        onSave={handleSaveColumn}
        onDelete={handleDeleteColumn}
      />
    </div>
  );
}
