import { useState, useEffect } from 'react';
import { Plus, Flag, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { GoalForm } from './forms/GoalForm';
import { useGoals } from '@/hooks/useGoals';
import { Goal } from '@/types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface ProjectGoalsProps {
  projectId: string;
}

export function ProjectGoals({ projectId }: ProjectGoalsProps) {
  const { goals, createGoal, updateGoal, deleteGoal, isLoading } = useGoals(); // Usar o hook useGoals sem projectId para pegar todas as metas
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [projectGoals, setProjectGoals] = useState<Goal[]>([]);

  // Filtrar as metas que pertencem a este projeto
  useEffect(() => {
    if (goals) {
      setProjectGoals(goals.filter(goal => goal.project_id === projectId));
    }
  }, [goals, projectId]);

  const handleCreateGoal = (goalData: Goal) => {
    createGoal({ ...goalData, project_id: projectId });
    setIsGoalFormOpen(false);
  };

  const handleUpdateGoal = (goalData: Goal) => {
    if (editingGoal) {
      updateGoal({ id: editingGoal.id, updates: { ...goalData, project_id: projectId } });
      setEditingGoal(null);
      setIsGoalFormOpen(false);
    }
  };

  const handleDeleteGoal = (goalId: string) => {
    deleteGoal(goalId);
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
              onSubmit={editingGoal ? handleUpdateGoal : handleCreateGoal}
              onCancel={() => {
                setIsGoalFormOpen(false);
                setEditingGoal(null);
              }}
              initialData={editingGoal}
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
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold">{goal.name}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => {
                      setEditingGoal(goal);
                      setIsGoalFormOpen(true);
                    }}>
                      <Edit2 className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-400">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente esta meta.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteGoal(goal.id)} className="bg-red-500 hover:bg-red-600">
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground">{goal.description}</p>
                {goal.due_date && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Vencimento: {new Date(goal.due_date).toLocaleDateString('pt-BR')}
                  </p>
                )}
                {/* Adicione mais detalhes da meta aqui se necessário */}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
