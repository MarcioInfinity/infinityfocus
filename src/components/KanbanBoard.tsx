
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, MoreHorizontal, Edit3, Trash2, Calendar, Clock } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { Task, TaskStatus } from '@/types';

const priorityColors = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  high: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
};

const columns = [
  { id: 'todo', title: 'A Fazer', color: 'bg-gray-500' },
  { id: 'in-progress', title: 'Em Progresso', color: 'bg-blue-500' },
  { id: 'review', title: 'Revisão', color: 'bg-yellow-500' },
  { id: 'done', title: 'Concluído', color: 'bg-green-500' }
];

interface KanbanBoardProps {
  projectId?: string;
  tasks?: Task[];
}

export function KanbanBoard({ projectId, tasks: propTasks }: KanbanBoardProps) {
  const { tasks: allTasks, updateTask } = useTasks();
  
  // Usar tasks do projeto se fornecidas, senão usar todas as tasks
  const tasks = propTasks || allTasks;
  
  // Filtrar tasks por projeto se projectId for fornecido
  const filteredTasks = projectId 
    ? tasks.filter(task => task.project_id === projectId)
    : tasks;

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    updateTask({ id: taskId, updates: { status: newStatus } });
  };

  const handleTaskComplete = (taskId: string, completed: boolean) => {
    updateTask({ 
      id: taskId, 
      updates: { status: completed ? 'done' : 'todo' } 
    });
  };

  return (
    <div className="space-y-4">
      {/* Kanban em metade do tamanho */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 h-[400px] lg:h-[500px]">
        {columns.map(column => {
          const columnTasks = filteredTasks.filter(task => task.status === column.id);
          
          return (
            <Card key={column.id} className="glass-card flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${column.color}`} />
                    {column.title}
                    <Badge variant="secondary" className="text-xs">
                      {columnTasks.length}
                    </Badge>
                  </CardTitle>
                  <Button variant="ghost" size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 overflow-y-auto space-y-2 p-3">
                {columnTasks.map(task => (
                  <Card key={task.id} className="glass-card border border-white/10 hover:border-white/20 transition-colors">
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        {/* Checkbox e título */}
                        <div className="flex items-start gap-2">
                          <Checkbox
                            checked={task.status === 'done'}
                            onCheckedChange={(checked) => handleTaskComplete(task.id, !!checked)}
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-sm font-medium line-clamp-2 ${
                              task.status === 'done' ? 'line-through opacity-60' : ''
                            }`}>
                              {task.title}
                            </h4>
                          </div>
                        </div>

                        {/* Descrição */}
                        {task.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        {/* Badges e informações */}
                        <div className="flex flex-wrap gap-1">
                          <Badge className={`${priorityColors[task.priority]} text-xs`}>
                            {task.priority === 'low' ? 'B' : task.priority === 'medium' ? 'M' : 'A'}
                          </Badge>
                          
                          {task.due_date && (
                            <Badge variant="outline" className="text-xs flex items-center gap-1">
                              <Calendar className="w-2 h-2" />
                              {new Date(task.due_date).toLocaleDateString('pt-BR', { 
                                day: '2-digit', 
                                month: '2-digit' 
                              })}
                            </Badge>
                          )}
                          
                          {task.start_time && (
                            <Badge variant="outline" className="text-xs flex items-center gap-1">
                              <Clock className="w-2 h-2" />
                              {task.start_time}
                            </Badge>
                          )}
                        </div>

                        {/* Botões de ação */}
                        <div className="flex justify-between items-center pt-1">
                          <div className="text-xs text-muted-foreground">
                            {new Date(task.created_at).toLocaleDateString('pt-BR', { 
                              day: '2-digit', 
                              month: '2-digit' 
                            })}
                          </div>
                          
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <Edit3 className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreHorizontal className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {columnTasks.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-xs text-muted-foreground">
                      Nenhuma tarefa
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
