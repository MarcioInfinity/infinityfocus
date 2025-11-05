import { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { TaskForm } from './forms/TaskForm';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useGoals } from '@/hooks/useGoals';
import { Task } from '@/types';
import { Plus, MoreHorizontal, Edit2, GripVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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
  { id: 'todo', title: 'A Fazer', color: 'bg-gray-500' },
  { id: 'in_progress', title: 'Em Progresso', color: 'bg-blue-500' },
  { id: 'review', title: 'Revisão', color: 'bg-purple-500' },
  { id: 'done', title: 'Concluído', color: 'bg-green-500' },
];

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const { tasks, updateTask, isLoading } = useTasks(projectId);
  const { projects } = useProjects();
  const { goals } = useGoals();
  const [columns, setColumns] = useState<Column[]>([]);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDraggingBoard, setIsDraggingBoard] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    const organized = defaultColumns.map(col => ({
      ...col,
      tasks: tasks.filter(task => task.status === col.id)
    }));
    setColumns(organized);
  }, [tasks]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const task = tasks.find(t => t.id === draggableId);
    if (!task) return;

    updateTask({
      id: task.id,
      updates: { status: destination.droppableId as any }
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.kanban-drag-area') && !target.closest('[data-no-drag]')) {
      setIsDraggingBoard(true);
      setStartX(e.pageX - (scrollContainerRef.current?.offsetLeft || 0));
      setScrollLeft(scrollContainerRef.current?.scrollLeft || 0);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.style.cursor = 'grabbing';
      }
    }
  };

  const handleMouseUp = () => {
    setIsDraggingBoard(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = 'grab';
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingBoard || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - (scrollContainerRef.current.offsetLeft || 0);
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
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
      default: return priority;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Quadro Kanban</h2>
        <Dialog open={isTaskFormOpen} onOpenChange={setIsTaskFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Nova Tarefa</DialogTitle>
            </DialogHeader>
            <TaskForm
              onSubmit={() => setIsTaskFormOpen(false)}
              onCancel={() => setIsTaskFormOpen(false)}
              projects={projects}
              goals={goals}
              initialData={{ project_id: projectId } as any}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div 
        ref={scrollContainerRef}
        className="overflow-x-auto pb-4 kanban-drag-area"
        style={{ cursor: 'grab', scrollBehavior: 'smooth' }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-6 min-w-max p-2">
            {columns.map((column) => (
              <div key={column.id} className="w-80 flex-shrink-0" data-no-drag>
                <div className={`${column.color} text-white p-3 rounded-t-lg font-semibold flex items-center justify-between`}>
                  <span>{column.title}</span>
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    {column.tasks.length}
                  </Badge>
                </div>
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`bg-muted/30 rounded-b-lg p-3 min-h-[500px] space-y-3 ${
                        snapshot.isDraggingOver ? 'bg-muted/50' : ''
                      }`}
                      data-no-drag
                    >
                      {column.tasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`${snapshot.isDragging ? 'shadow-lg ring-2 ring-primary' : ''}`}
                              data-no-drag
                            >
                              <CardContent className="p-4">
                                <div className="space-y-3">
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-2 flex-1">
                                      <div {...provided.dragHandleProps} className="mt-1 cursor-grab active:cursor-grabbing" data-no-drag>
                                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                                      </div>
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-sm">{task.title}</h4>
                                        {task.description && (
                                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                            {task.description}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" data-no-drag>
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => setEditingTask(task)}>
                                          <Edit2 className="h-4 w-4 mr-2" />
                                          Editar
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>

                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Badge variant="outline" className="text-xs">
                                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)} mr-1`} />
                                      {getPriorityLabel(task.priority)}
                                    </Badge>
                                    {task.due_date && (
                                      <Badge variant="secondary" className="text-xs">
                                        {new Date(task.due_date).toLocaleDateString('pt-BR')}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
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
      </div>

      {editingTask && (
        <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Tarefa</DialogTitle>
            </DialogHeader>
            <TaskForm
              onSubmit={() => setEditingTask(null)}
              onCancel={() => setEditingTask(null)}
              initialData={editingTask}
              projects={projects}
              goals={goals}
            />
          </DialogContent>
        </Dialog>
      )}

      <div className="text-center text-sm text-muted-foreground mt-4">
        <p>💡 Arraste os cards entre as colunas ou arraste o quadro para navegar</p>
      </div>
    </div>
  );
}
