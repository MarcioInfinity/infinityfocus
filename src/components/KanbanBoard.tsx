import { useState, useEffect } from 'react';
import { Plus, MoreHorizontal, Edit, Trash2, Calendar, Clock, User, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { TaskForm } from './forms/TaskForm';
import { EditTaskModal } from './modals/EditTaskModal';
import { useTasks } from "@/hooks/useTasks";
import { useProjects } from '@/hooks/useProjects';
import { useGoals } from '@/hooks/useGoals';
import { useToastNotifications } from '@/hooks/use-toast-notifications';
import { Task } from '@/types';

interface KanbanBoardProps {
  projectId: string;
}

const KANBAN_COLUMNS = [
  { id: 'todo', title: 'A Fazer', color: 'bg-gray-500/20' },
  { id: 'in_progress', title: 'Em Progresso', color: 'bg-blue-500/20' },
  { id: 'review', title: 'Em Revisão', color: 'bg-yellow-500/20' },
  { id: 'done', title: 'Concluído', color: 'bg-green-500/20' },
];

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  // CORREÇÃO #4: Usar hook melhorado de tarefas
  const { tasks, createTask, updateTask, deleteTask } = useTasks();
  const { projects } = useProjects();
  const { goals } = useGoals();
  const { showSuccessToast, showErrorToast } = useToastNotifications();

  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  // CORREÇÃO #4: Filtrar tarefas do projeto atual
  const projectTasks = tasks.filter(task => task.project_id === projectId);
  const currentProject = projects.find(p => p.id === projectId);

  // CORREÇÃO #4: Função para criar tarefa no projeto atual
  const handleCreateTask = (taskData: any) => {
    try {
      // Garantir que a tarefa seja criada com o ID do projeto atual
      const taskWithProject = {
        ...taskData,
        project_id: projectId,
        assign_to_project: true,
      };
      
      createTask(taskWithProject);
      setIsTaskFormOpen(false);
      showSuccessToast('Tarefa criada no projeto com sucesso!');
    } catch (error) {
      console.error('Erro ao criar tarefa no projeto:', error);
      showErrorToast('Erro ao criar tarefa no projeto');
    }
  };

  const handleEditTask = (taskData: any) => {
    try {
      updateTask({ id: taskData.id, updates: taskData });
      setIsEditModalOpen(false);
      setSelectedTask(null);
      showSuccessToast('Tarefa atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      showErrorToast('Erro ao atualizar tarefa');
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

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    
    if (draggedTask && draggedTask.status !== newStatus) {
      updateTask({ 
        id: draggedTask.id, 
        updates: { status: newStatus as any } 
      });
      showSuccessToast(`Tarefa movida para ${KANBAN_COLUMNS.find(col => col.id === newStatus)?.title}`);
    }
    
    setDraggedTask(null);
  };

  const openEditModal = (task: Task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-500/50 text-red-400';
      case 'medium':
        return 'border-yellow-500/50 text-yellow-400';
      case 'low':
        return 'border-green-500/50 text-green-400';
      default:
        return 'border-gray-500/50 text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    try {
      const [hours, minutes] = timeString.split(':');
      return `${hours}:${minutes}`;
    } catch {
      return timeString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">
            Quadro Kanban - {currentProject?.name || 'Projeto'}
          </h2>
          <p className="text-muted-foreground">
            {projectTasks.length} tarefa{projectTasks.length !== 1 ? 's' : ''} no projeto
          </p>
        </div>
        
        {/* CORREÇÃO #4: Botão de criar tarefa funcional */}
        <Dialog open={isTaskFormOpen} onOpenChange={setIsTaskFormOpen}>
          <DialogTrigger asChild>
            <Button className="glow-button">
              <Plus className="w-4 h-4 mr-2" />
              + Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
            <TaskForm 
              onSubmit={handleCreateTask} 
              onCancel={() => setIsTaskFormOpen(false)}
              projects={projects}
              goals={goals}
              defaultProjectId={projectId}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {KANBAN_COLUMNS.map(column => {
          const columnTasks = projectTasks.filter(task => task.status === column.id);
          
          return (
            <div
              key={column.id}
              className="space-y-4"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {/* Column Header */}
              <div className={`rounded-lg p-4 ${column.color}`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{column.title}</h3>
                  <Badge variant="outline" className="text-xs">
                    {columnTasks.length}
                  </Badge>
                </div>
              </div>

              {/* Tasks */}
              <div className="space-y-3 min-h-[200px]">
                {columnTasks.map(task => (
                  <Card
                    key={task.id}
                    className="glass-card cursor-move hover:scale-105 transition-transform"
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-sm font-medium line-clamp-2">
                          {task.title}
                        </CardTitle>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreHorizontal className="w-3 h-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="glass-card border-white/20">
                            <DropdownMenuItem onClick={() => openEditModal(task)}>
                              <Edit className="w-3 h-3 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteTask(task.id)}
                              className="text-red-400"
                            >
                              <Trash2 className="w-3 h-3 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0 space-y-3">
                      {task.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      {/* Priority Badge */}
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getPriorityColor(task.priority)}`}
                      >
                        {task.priority === 'high' ? 'Alta' : 
                         task.priority === 'medium' ? 'Média' : 'Baixa'}
                      </Badge>

                      {/* Task Details */}
                      <div className="space-y-1">
                        {task.due_date && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(task.due_date)}</span>
                          </div>
                        )}
                        
                        {task.start_time && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{formatTime(task.start_time)}</span>
                          </div>
                        )}

                        {task.assigned_to && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <User className="w-3 h-3" />
                            <span>Atribuída</span>
                          </div>
                        )}

                        {task.tags && task.tags.length > 0 && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Tag className="w-3 h-3" />
                            <span>{task.tags.length} tag{task.tags.length !== 1 ? 's' : ''}</span>
                          </div>
                        )}

                        {task.repeat_enabled && (
                          <div className="flex items-center gap-1 text-xs text-blue-400">
                            <span>🔄</span>
                            <span>
                              {task.repeat_type === 'daily' ? 'Diário' : 
                               task.repeat_type === 'weekly' ? 'Semanal' :
                               task.repeat_type === 'monthly' ? 'Mensal' : 'Personalizado'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Progress Indicator for tasks with checklist */}
                      {task.checklist && task.checklist.length > 0 && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Checklist</span>
                            <span className="text-muted-foreground">
                              {task.checklist.filter(item => item.completed).length}/{task.checklist.length}
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-1">
                            <div 
                              className="bg-primary h-1 rounded-full transition-all" 
                              style={{ 
                                width: `${(task.checklist.filter(item => item.completed).length / task.checklist.length) * 100}%` 
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {/* Empty State */}
                {columnTasks.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="text-4xl mb-2">📋</div>
                    <p className="text-sm">Nenhuma tarefa</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Task Modal */}
      <EditTaskModal
        task={selectedTask}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTask(null);
        }}
        onSave={handleEditTask}
        projects={projects}
        goals={goals}
      />
    </div>
  );
}

