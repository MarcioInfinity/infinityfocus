import { useState, useEffect } from 'react';
import { Plus, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { GoalForm } from './forms/GoalForm';
import { useGoals } from '@/hooks/useGoals';
import { Goal } from '@/types';

interface ProjectGoalsProps {
  projectId: string;
}

export function ProjectGoals({ projectId }: ProjectGoalsProps) {
  const { goals, createGoal, isLoading } = useGoals();
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);
  const [projectGoals, setProjectGoals] = useState<Goal[]>([]);

  useEffect(() => {
    if (goals) {
      setProjectGoals(goals.filter(goal => goal.project_id === projectId));
    }
  }, [goals, projectId]);

  const handleCreateGoal = (goalData: any) => {
    createGoal({ ...goalData, project_id: projectId });
    setIsGoalFormOpen(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <p className="text-muted-foreground">Carregando metas do projeto...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Metas do Projeto</h2>
        <Dialog open={isGoalFormOpen} onOpenChange={setIsGoalFormOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="glow-button">
              <Plus className="w-4 h-4 mr-1" />
              Nova Meta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
            <GoalForm
              onSubmit={handleCreateGoal}
              onCancel={() => setIsGoalFormOpen(false)}
              defaultProjectId={projectId}
            />
          </DialogContent>
        </Dialog>
      </div>

      {projectGoals.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="text-center py-12">
            <Flag className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma meta definida para este projeto</h3>
            <p className="text-muted-foreground mb-4">Crie metas para acompanhar o progresso do seu projeto.</p>
            <Dialog open={isGoalFormOpen} onOpenChange={setIsGoalFormOpen}>
              <DialogTrigger asChild>
                <Button className="glow-button">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira Meta do Projeto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                <GoalForm
                  onSubmit={handleCreateGoal}
                  onCancel={() => setIsGoalFormOpen(false)}
                  defaultProjectId={projectId}
                />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projectGoals.map(goal => (
            <Card key={goal.id} className="glass-card">
              <CardHeader>
                <CardTitle>{goal.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{goal.description}</p>
                {/* Add more goal details here if needed */}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

