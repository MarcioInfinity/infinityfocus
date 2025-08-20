import React, { memo, useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Task } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TaskItemProps {
  index: number;
  style: React.CSSProperties;
  data: {
    tasks: Task[];
    onToggleTask: (taskId: string, completed: boolean) => void;
    onSelectTask: (task: Task) => void;
  };
}

const TaskItem = memo(({ index, style, data }: TaskItemProps) => {
  const { tasks, onToggleTask, onSelectTask } = data;
  const task = tasks[index];

  const handleToggle = useCallback((checked: boolean) => {
    onToggleTask(task.id, checked);
  }, [task.id, onToggleTask]);

  const handleClick = useCallback(() => {
    onSelectTask(task);
  }, [task, onSelectTask]);

  const priorityColor = useMemo(() => {
    switch (task.priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  }, [task.priority]);

  const statusColor = useMemo(() => {
    switch (task.status) {
      case 'done': return 'default';
      case 'in-progress': return 'secondary';
      case 'review': return 'outline';
      case 'todo': return 'outline';
      default: return 'outline';
    }
  }, [task.status]);

  const dueDateText = useMemo(() => {
    if (!task.due_date) return null;
    return formatDistanceToNow(new Date(task.due_date), {
      addSuffix: true,
      locale: ptBR
    });
  }, [task.due_date]);

  return (
    <div style={style}>
      <Card className="mx-2 mb-2 hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-3" onClick={handleClick}>
          <div className="flex items-start gap-3">
            <Checkbox
              checked={task.status === 'done'}
              onCheckedChange={handleToggle}
              onClick={(e) => e.stopPropagation()}
              className="mt-1"
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className={`text-sm font-medium truncate ${
                  task.status === 'done' ? 'line-through text-muted-foreground' : ''
                }`}>
                  {task.title}
                </h4>
                <Badge variant={priorityColor}>
                  {task.priority === 'high' ? 'Alta' : 
                   task.priority === 'medium' ? 'Média' : 'Baixa'}
                </Badge>
              </div>
              
              {task.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {task.description}
                </p>
              )}
              
              <div className="flex items-center gap-2 text-xs">
                <Badge variant={statusColor}>
                  {task.status === 'done' ? 'Concluída' :
                   task.status === 'in-progress' ? 'Em andamento' : 
                   task.status === 'review' ? 'Em revisão' : 'A fazer'}
                </Badge>
                
                {dueDateText && (
                  <span className="text-muted-foreground">
                    Vence {dueDateText}
                  </span>
                )}
                
                {task.tags?.length > 0 && (
                  <div className="flex gap-1 ml-auto">
                    {task.tags.slice(0, 2).map((tag, i) => (
                      <Badge key={i} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                    {task.tags.length > 2 && (
                      <span className="text-muted-foreground">
                        +{task.tags.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

TaskItem.displayName = 'TaskItem';

interface OptimizedTaskListProps {
  tasks: Task[];
  onToggleTask: (taskId: string, completed: boolean) => void;
  onSelectTask: (task: Task) => void;
  height?: number;
}

export const OptimizedTaskList = memo(({ 
  tasks, 
  onToggleTask, 
  onSelectTask, 
  height = 400 
}: OptimizedTaskListProps) => {
  const itemData = useMemo(() => ({
    tasks,
    onToggleTask,
    onSelectTask,
  }), [tasks, onToggleTask, onSelectTask]);

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhuma tarefa encontrada
      </div>
    );
  }

  return (
    <List
      height={height}
      width="100%"
      itemCount={tasks.length}
      itemSize={100}
      itemData={itemData}
      className="task-list-scrollbar"
    >
      {TaskItem}
    </List>
  );
});

OptimizedTaskList.displayName = 'OptimizedTaskList';