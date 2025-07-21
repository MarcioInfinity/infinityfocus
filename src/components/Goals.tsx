import { useState } from 'react';
import { Plus, Target, Trophy, CheckCircle, Calendar, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { GoalForm } from './forms/GoalForm';
import { EditGoalModal } from './modals/EditGoalModal';
import { GoalDetailsModal } from './modals/GoalDetailsModal';
import { useGoals } from '@/hooks/useGoals';
import { Goal } from '@/types';
import { RewardsTab } from './RewardsTab';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface GoalCardProps {
  goal: Goal;
  onEdit: () => void;
  onView: () => void;
  getPriorityColor: (priority: string) => string;
  getProgressColor: (progress: number) => string;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, onEdit, onView, getPriorityColor, getProgressColor }) => {
  return (
    <Card className="glass-card hover:border-primary/30 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">{goal.name}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground line-clamp-2">
              {goal.description}
            </CardDescription>
          </div>
          <Button variant="outline" size="icon" onClick={onView} className="h-8 w-8 p-0">
            <Clock className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Progresso:</span>
          <span className="font-medium">{goal.progress}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300`}
            style={{ width: `${goal.progress}%`, backgroundColor: getProgressColor(goal.progress) }}
          />
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Prioridade:</span>
          <span className={`font-medium ${getPriorityColor(goal.priority)}`}>{goal.priority}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Prazo:</span>
          <span className="font-medium">
            {goal.due_date ? new Date(goal.due_date).toLocaleDateString('pt-BR') : 'Sem prazo'}
          </span>
        </div>
        <div className="flex justify-end">
          <Button variant="secondary" size="sm" onClick={onEdit}>
            Editar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export function Goals() {
  const { goals, createGoal, updateGoal, deleteGoal, isLoading } = useGoals();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');

  const filteredGoals = goals.filter(goal => {
    switch (filter) {
      case 'active':
        return goal.progress < 100;
      case 'completed':
        return goal.progress === 100;
      default:
        return true;
    }
  });

  const handleCreateGoal = (goalData: any) => {
    createGoal(goalData);
    setIsCreateModalOpen(false);
  };

  const handleUpdateGoal = (updatedGoal: Goal) => {
    updateGoal({
      id: updatedGoal.id,
      updates: updatedGoal
    });
    setEditingGoal(null);
  };

  const handleDeleteGoal = (goalId: string) => {
    deleteGoal(goalId);
    setSelectedGoal(null);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Metas
          </h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-card p-6 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-muted rounded w-full mb-2"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Metas
          </h1>
          <p className="text-muted-foreground mt-1">
            Defina e acompanhe seus objetivos pessoais e profissionais
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="glow-button">
              <Plus className="w-4 h-4 mr-2" />
              Nova Meta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
            <GoalForm 
              onSubmit={handleCreateGoal} 
              onCancel={() => setIsCreateModalOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-4 glass-card">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Ativas
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Concluídas
          </TabsTrigger>
          <TabsTrigger value="rewards" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Recompensas
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Todas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGoals.filter(goal => goal.progress < 100).map((goal) => (
              <GoalCard 
                key={goal.id} 
                goal={goal} 
                onEdit={() => setEditingGoal(goal)}
                onView={() => setSelectedGoal(goal)}
                getPriorityColor={getPriorityColor}
                getProgressColor={getProgressColor}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGoals.filter(goal => goal.progress === 100).map((goal) => (
              <GoalCard 
                key={goal.id} 
                goal={goal} 
                onEdit={() => setEditingGoal(goal)}
                onView={() => setSelectedGoal(goal)}
                getPriorityColor={getPriorityColor}
                getProgressColor={getProgressColor}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <RewardsTab />
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => (
              <GoalCard 
                key={goal.id} 
                goal={goal} 
                onEdit={() => setEditingGoal(goal)}
                onView={() => setSelectedGoal(goal)}
                getPriorityColor={getPriorityColor}
                getProgressColor={getProgressColor}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <EditGoalModal
        goal={editingGoal}
        isOpen={!!editingGoal}
        onClose={() => setEditingGoal(null)}
        onSave={handleUpdateGoal}
      />

      <GoalDetailsModal
        goal={selectedGoal}
        isOpen={!!selectedGoal}
        onClose={() => setSelectedGoal(null)}
        onDelete={handleDeleteGoal}
        onUpdate={handleUpdateGoal}
      />
    </div>
  );
}
