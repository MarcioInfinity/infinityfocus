
import { useState } from 'react';
import { 
  Plus, 
  Target, 
  TrendingUp, 
  Calendar, 
  Trophy,
  Star,
  Gift,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { GoalForm } from './forms/GoalForm';
import { EditGoalModal } from './modals/EditGoalModal';
import { GoalDetailsModal } from './modals/GoalDetailsModal';
import { Goal } from '@/types';

const mockGoals: Goal[] = [];

const priorityColors = {
  low: 'bg-green-500/20 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  high: 'bg-red-500/20 text-red-400 border-red-500/30'
};

export function Goals() {
  const [goals, setGoals] = useState<Goal[]>(mockGoals);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [viewingGoal, setViewingGoal] = useState<Goal | null>(null);

  const handleCreateGoal = (goalData: any) => {
    const newGoal: Goal = {
      id: Date.now().toString(),
      ...goalData,
      progress: 0,
      created_by: 'current-user-id',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      assigned_projects: goalData.assigned_projects || [],
      assigned_tasks: goalData.assigned_tasks || [],
    };
    setGoals([...goals, newGoal]);
    setIsFormOpen(false);
  };

  const handleUpdateGoal = (updatedGoal: Goal) => {
    setGoals(goals.map(goal => 
      goal.id === updatedGoal.id ? updatedGoal : goal
    ));
    setEditingGoal(null);
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals(goals.filter(goal => goal.id !== goalId));
    setViewingGoal(null);
  };

  const getPriorityIcon = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Metas
          </h1>
          <p className="text-muted-foreground mt-1">
            Defina objetivos, acompanhe progresso e celebre conquistas
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button className="glow-button">
              <Plus className="w-4 h-4 mr-2" />
              Nova Meta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <GoalForm
              onSubmit={handleCreateGoal}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{goals.length}</p>
                <p className="text-xs text-muted-foreground">Total de Metas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold">{goals.filter(g => g.progress >= 80).length}</p>
                <p className="text-xs text-muted-foreground">Quase Concluídas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Trophy className="h-8 w-8 text-yellow-400" />
              <div>
                <p className="text-2xl font-bold">{goals.filter(g => g.progress === 100).length}</p>
                <p className="text-xs text-muted-foreground">Concluídas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Gift className="h-8 w-8 text-accent" />
              <div>
                <p className="text-2xl font-bold">{goals.filter(g => g.reward_enabled).length}</p>
                <p className="text-xs text-muted-foreground">Com Recompensa</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {goals.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="text-center py-12">
              <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">
                Nenhuma meta encontrada
              </h3>
              <p className="text-muted-foreground mb-4">
                Comece definindo sua primeira meta para acompanhar seu progresso
              </p>
              <Button 
                className="glow-button"
                onClick={() => setIsFormOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Meta
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {goals.map((goal) => {
              const daysLeft = goal.due_date 
                ? Math.ceil((new Date(goal.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                : 0;
              
              return (
                <Card key={goal.id} className="project-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={priorityColors[goal.priority]}>
                          {getPriorityIcon(goal.priority)} {goal.priority.toUpperCase()}
                        </Badge>
                        {goal.is_shared && (
                          <Badge variant="outline" className="bg-blue-500/20 text-blue-400">
                            <Share2 className="w-3 h-3 mr-1" />
                            Compartilhada
                          </Badge>
                        )}
                      </div>
                      {goal.reward_enabled && (
                        <Gift className="w-5 h-5 text-accent" />
                      )}
                    </div>
                    <CardTitle className="text-xl">{goal.name}</CardTitle>
                    {goal.description && (
                      <p className="text-sm text-muted-foreground">{goal.description}</p>
                    )}
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progresso</span>
                        <span className="font-medium">{goal.progress}%</span>
                      </div>
                      <Progress 
                        value={goal.progress} 
                        className="h-3"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0%</span>
                        <span>100%</span>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span className={daysLeft < 0 ? 'text-red-400' : daysLeft < 7 ? 'text-yellow-400' : 'text-muted-foreground'}>
                        {daysLeft < 0 
                          ? `Atrasada há ${Math.abs(daysLeft)} dias`
                          : daysLeft === 0 
                          ? 'Prazo hoje!'
                          : `${daysLeft} dias restantes`
                        }
                      </span>
                    </div>

                    {/* Reward */}
                    {goal.reward_enabled && goal.reward_description && (
                      <div className="p-3 glass-card rounded-lg border border-accent/20">
                        <p className="text-sm flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-accent" />
                          <span className="font-medium">Recompensa:</span>
                          {goal.reward_description}
                        </p>
                      </div>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {goal.category}
                      </Badge>
                      {goal.assigned_projects.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {goal.assigned_projects.length} projeto(s)
                        </Badge>
                      )}
                      {goal.assigned_tasks.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {goal.assigned_tasks.length} tarefa(s)
                        </Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 neon-border"
                        onClick={() => setEditingGoal(goal)}
                      >
                        Editar
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 glow-button"
                        onClick={() => setViewingGoal(goal)}
                      >
                        Ver Detalhes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <Button 
        className="floating-action animate-pulse-glow"
        onClick={() => setIsFormOpen(true)}
      >
        <Plus className="w-6 h-6" />
      </Button>

      {/* Modals */}
      {editingGoal && (
        <EditGoalModal
          goal={editingGoal}
          isOpen={!!editingGoal}
          onClose={() => setEditingGoal(null)}
          onSave={handleUpdateGoal}
        />
      )}

      {viewingGoal && (
        <GoalDetailsModal
          goal={viewingGoal}
          isOpen={!!viewingGoal}
          onClose={() => setViewingGoal(null)}
          onDelete={handleDeleteGoal}
          onUpdate={handleUpdateGoal}
        />
      )}
    </div>
  );
}
