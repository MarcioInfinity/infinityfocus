
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Gift, Trophy, Star, Calendar, CheckCircle } from 'lucide-react';
import { useGoals } from '@/hooks/useGoals';

export function RewardsTab() {
  const { goals } = useGoals();

  // Filtrar metas com recompensas ativadas
  const rewardGoals = goals.filter(goal => goal.reward_enabled && goal.reward_description);

  // Separar metas por status
  const completedGoals = rewardGoals.filter(goal => goal.progress === 100);
  const nearCompletionGoals = rewardGoals.filter(goal => goal.progress >= 80 && goal.progress < 100);
  const inProgressGoals = rewardGoals.filter(goal => goal.progress < 80);

  const getRewardIcon = (category: string) => {
    switch (category) {
      case 'personal': return '🎁';
      case 'professional': return '🏆';
      case 'health': return '⚡';
      case 'finance': return '💰';
      case 'education': return '📚';
      default: return '🎯';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const RewardCard = ({ goal }: { goal: any }) => (
    <Card className="glass-card hover:border-primary/30 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{getRewardIcon(goal.category)}</div>
            <div>
              <CardTitle className="text-lg">{goal.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {goal.description}
              </p>
            </div>
          </div>
          <Badge variant="outline" className={getPriorityColor(goal.priority)}>
            {goal.priority}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Gift className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium">Recompensa:</span>
        </div>
        
        <div className="bg-accent/10 border border-accent/30 rounded-lg p-3">
          <p className="text-sm text-accent font-medium">
            {goal.reward_description}
          </p>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progresso:</span>
          <span className="font-medium">{goal.progress}%</span>
        </div>

        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-300"
            style={{ width: `${goal.progress}%` }}
          />
        </div>

        {goal.due_date && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Prazo: {new Date(goal.due_date).toLocaleDateString('pt-BR')}</span>
          </div>
        )}

        {goal.progress === 100 && (
          <Button className="w-full glow-button" size="sm">
            <Trophy className="w-4 h-4 mr-2" />
            Resgatar Recompensa
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Metas Concluídas */}
      {completedGoals.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-semibold">Recompensas Disponíveis</h3>
            <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
              {completedGoals.length}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedGoals.map((goal) => (
              <RewardCard key={goal.id} goal={goal} />
            ))}
          </div>
        </div>
      )}

      {/* Metas Próximas da Conclusão */}
      {nearCompletionGoals.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-semibold">Quase Lá!</h3>
            <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
              {nearCompletionGoals.length}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nearCompletionGoals.map((goal) => (
              <RewardCard key={goal.id} goal={goal} />
            ))}
          </div>
        </div>
      )}

      {/* Metas em Progresso */}
      {inProgressGoals.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Recompensas Futuras</h3>
            <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">
              {inProgressGoals.length}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inProgressGoals.map((goal) => (
              <RewardCard key={goal.id} goal={goal} />
            ))}
          </div>
        </div>
      )}

      {/* Estado vazio */}
      {rewardGoals.length === 0 && (
        <Card className="glass-card">
          <CardContent className="text-center py-12">
            <Gift className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma recompensa configurada</h3>
            <p className="text-muted-foreground">
              Configure recompensas em suas metas para motivar-se ainda mais!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
