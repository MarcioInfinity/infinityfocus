import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Calendar,
  Clock,
  Tag,
  User,
  CheckSquare,
  MessageSquare,
  Activity,
  Trash2,
  Plus
} from 'lucide-react';
import { Task } from '@/types';
import { useChecklists } from '@/hooks/useChecklists';
import { useObservations } from '@/hooks/useObservations';
import { useActivities } from '@/hooks/useActivities';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TaskDetailsProps {
  task: Task;
}

export function TaskDetails({ task }: TaskDetailsProps) {
  const [newObservation, setNewObservation] = useState('');
  const [newChecklistItem, setNewChecklistItem] = useState('');

  const {
    checklist,
    createItem,
    updateItem,
    deleteItem,
    isLoading: checklistLoading
  } = useChecklists(task.id, 'task');

  const {
    observations,
    createObservation,
    deleteObservation,
    isLoading: observationsLoading
  } = useObservations(task.id, 'task');

  const {
    activities,
    isLoading: activitiesLoading
  } = useActivities(task.id, 'task');

  const handleAddChecklist = () => {
    if (newChecklistItem.trim()) {
      createItem({
        title: newChecklistItem,
        position: checklist.length
      });
      setNewChecklistItem('');
    }
  };

  const handleToggleChecklistItem = (itemId: string, completed: boolean) => {
    updateItem({
      id: itemId,
      updates: { completed: !completed }
    });
  };

  const handleAddObservation = () => {
    if (newObservation.trim()) {
      createObservation(newObservation);
      setNewObservation('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Task Info */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5" />
            Informações da Tarefa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">{task.title}</h3>
            {task.description && (
              <p className="text-muted-foreground mt-2">{task.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {task.start_date && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>Início: {format(new Date(task.start_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
              </div>
            )}
            {task.due_date && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>Vencimento: {format(new Date(task.due_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
              </div>
            )}
            {task.start_time && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>Horário: {task.start_time}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Badge>{task.priority}</Badge>
            <Badge variant="outline">{task.category}</Badge>
            <Badge variant="outline">{task.status}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Checklist */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5" />
            Checklist
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Adicionar item..."
              value={newChecklistItem}
              onChange={(e) => setNewChecklistItem(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddChecklist()}
            />
            <Button onClick={handleAddChecklist} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-2">
            {checklist.map((item) => (
              <div key={item.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => handleToggleChecklistItem(item.id, item.completed)}
                  className="rounded"
                />
                <span className={item.completed ? 'line-through opacity-60' : ''}>
                  {item.title}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteItem(item.id)}
                  className="ml-auto text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Observations */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Observações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Textarea
              placeholder="Adicionar observação..."
              value={newObservation}
              onChange={(e) => setNewObservation(e.target.value)}
              className="min-h-[80px]"
            />
            <Button onClick={handleAddObservation} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <ScrollArea className="h-[200px]">
            <div className="space-y-3">
              {observations.map((obs) => (
                <div key={obs.id} className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-sm">{obs.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(obs.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteObservation(obs.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Histórico de Atividades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px]">
            <div className="space-y-3">
              {activities.map((activity) => (
                <div key={activity.id} className="flex gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-muted-foreground">{activity.description}</p>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(activity.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
