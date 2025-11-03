import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Calendar,
  Target,
  MessageSquare,
  Activity,
  Trash2,
  Plus,
  Award
} from 'lucide-react';
import { Goal } from '@/types';
import { useObservations } from '@/hooks/useObservations';
import { useActivities } from '@/hooks/useActivities';
import { GoalChecklist } from '@/components/GoalChecklist';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface GoalDetailsProps {
  goal: Goal;
}

export function GoalDetails({ goal }: GoalDetailsProps) {
  const [newObservation, setNewObservation] = useState('');

  const {
    observations,
    createObservation,
    deleteObservation
  } = useObservations(goal.id, 'goal');

  const {
    activities
  } = useActivities(goal.id, 'goal');

  const handleAddObservation = () => {
    if (newObservation.trim()) {
      createObservation(newObservation);
      setNewObservation('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Goal Info */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Informações da Meta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">{goal.name}</h3>
            {goal.description && (
              <p className="text-muted-foreground mt-2">{goal.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-medium">{Math.round(goal.progress || 0)}%</span>
            </div>
            <Progress value={goal.progress || 0} className="h-3" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {goal.start_date && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>Início: {format(new Date(goal.start_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
              </div>
            )}
            {goal.due_date && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>Término: {format(new Date(goal.due_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Badge>{goal.priority}</Badge>
            <Badge variant="outline">{goal.category}</Badge>
            {goal.reward_enabled && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Award className="w-3 h-3" />
                Recompensa
              </Badge>
            )}
          </div>

          {goal.reward_enabled && goal.reward_description && (
            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-sm font-medium flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-400" />
                Recompensa:
              </p>
              <p className="text-sm text-muted-foreground mt-1">{goal.reward_description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Goal Checklist */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Checklist da Meta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <GoalChecklist goalId={goal.id} />
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
