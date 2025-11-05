import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Trash2, CheckCircle2 } from 'lucide-react';
import { useRewards } from '@/hooks/useRewards';

interface Reward {
  id: string;
  title: string;
  description?: string;
  celebration_level: string;
  investment_value?: number;
  currency?: string;
  attributed_to_type: string;
  attributed_to_id: string;
  attributed_item_name?: string;
  is_claimed?: boolean;
  claimed_at?: string;
  created_at: string;
}

interface RewardCardProps {
  reward: Reward;
}

export function RewardCard({ reward }: RewardCardProps) {
  const { deleteReward, claimReward } = useRewards();

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja deletar esta recompensa?')) {
      await deleteReward(reward.id);
    }
  };

  const handleClaim = async () => {
    await claimReward(reward.id);
  };

  const getCelebrationColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      case 'medium':
        return 'bg-gradient-to-r from-blue-500 to-purple-500';
      case 'low':
        return 'bg-gradient-to-r from-green-500 to-teal-500';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  return (
    <Card className={`relative overflow-hidden ${reward.is_claimed ? 'opacity-70' : ''}`}>
      <div className={`absolute top-0 left-0 right-0 h-2 ${getCelebrationColor(reward.celebration_level)}`} />
      
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{reward.title}</CardTitle>
          </div>
          {reward.is_claimed && (
            <Badge variant="outline" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Resgatada
            </Badge>
          )}
        </div>
        {reward.description && (
          <CardDescription>{reward.description}</CardDescription>
        )}
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {reward.investment_value && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Valor:</span>
              <span className="font-semibold">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: reward.currency || 'BRL',
                }).format(reward.investment_value)}
              </span>
            </div>
          )}

          {reward.attributed_item_name && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Atribuída à:</span>
              <span className="font-medium">{reward.attributed_item_name}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Nível:</span>
            <Badge variant={
              reward.celebration_level === 'high' ? 'default' :
              reward.celebration_level === 'medium' ? 'secondary' : 'outline'
            }>
              {reward.celebration_level === 'high' ? 'Alto' :
               reward.celebration_level === 'medium' ? 'Médio' : 'Baixo'}
            </Badge>
          </div>

          {reward.claimed_at && (
            <div className="text-xs text-muted-foreground">
              Resgatada em: {new Date(reward.claimed_at).toLocaleDateString('pt-BR')}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            {!reward.is_claimed && (
              <Button
                onClick={handleClaim}
                variant="default"
                size="sm"
                className="flex-1"
              >
                <Gift className="h-4 w-4 mr-2" />
                Resgatar
              </Button>
            )}
            <Button
              onClick={handleDelete}
              variant="destructive"
              size="sm"
              className={reward.is_claimed ? 'flex-1' : ''}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Deletar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
