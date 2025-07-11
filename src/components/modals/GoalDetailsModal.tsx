
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { 
  Target, Trophy, Calendar, Users, ClipboardList, 
  Trash2, Share2, Gift, AlertTriangle 
} from 'lucide-react';
import { Goal } from '@/types';

interface GoalDetailsModalProps {
  goal: Goal;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (goalId: string) => void;
  onUpdate: (updatedGoal: Goal) => void;
}

export function GoalDetailsModal({ goal, isOpen, onClose, onDelete, onUpdate }: GoalDetailsModalProps) {
  const [notes, setNotes] = useState(goal.notes || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSaveNotes = () => {
    onUpdate({ ...goal, notes, updated_at: new Date().toISOString() });
  };

  const handleDelete = () => {
    onDelete(goal.id);
    onClose();
  };

  const daysLeft = goal.due_date 
    ? Math.ceil((new Date(goal.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const priorityColors = {
    low: 'bg-green-500/20 text-green-400 border-green-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    high: 'bg-red-500/20 text-red-400 border-red-500/30'
  };

  const getPriorityIcon = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass-card">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {goal.name}
              </DialogTitle>
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
                <Badge variant="secondary">{goal.category}</Badge>
              </div>
            </div>
            {goal.reward_enabled && (
              <Gift className="w-8 h-8 text-accent" />
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Section */}
          <div className="glass-card p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Progresso da Meta</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Progresso Atual</span>
                <span className="font-bold text-xl">{goal.progress}%</span>
              </div>
              <Progress value={goal.progress} className="h-4" />
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <p className="text-muted-foreground">Início</p>
                  <p className="font-medium">
                    {goal.start_date ? new Date(goal.start_date).toLocaleDateString('pt-BR') : 'Não definido'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Prazo</p>
                  <p className={`font-medium ${daysLeft < 0 ? 'text-red-400' : daysLeft < 7 ? 'text-yellow-400' : ''}`}>
                    {daysLeft < 0 
                      ? `Atrasada há ${Math.abs(daysLeft)} dias`
                      : daysLeft === 0 
                      ? 'Prazo hoje!'
                      : `${daysLeft} dias restantes`
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {goal.description && (
            <div className="glass-card p-4 space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                Descrição
              </h3>
              <p className="text-muted-foreground">{goal.description}</p>
            </div>
          )}

          {/* Reward */}
          {goal.reward_enabled && goal.reward_description && (
            <div className="glass-card p-4 space-y-3 border border-accent/20">
              <h3 className="font-semibold flex items-center gap-2 text-accent">
                <Trophy className="w-5 h-5" />
                Recompensa
              </h3>
              <p className="text-accent/80">{goal.reward_description}</p>
            </div>
          )}

          {/* Connected Projects and Tasks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goal.assigned_projects.length > 0 && (
              <div className="glass-card p-4 space-y-3">
                <h3 className="font-semibold">Projetos Vinculados</h3>
                <div className="space-y-2">
                  {goal.assigned_projects.map((projectId, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted/20 rounded">
                      <div className="w-3 h-3 bg-primary rounded-full" />
                      <span className="text-sm">Projeto {index + 1}</span>
                      <Badge variant="outline" className="ml-auto text-xs">
                        Ativo
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {goal.assigned_tasks.length > 0 && (
              <div className="glass-card p-4 space-y-3">
                <h3 className="font-semibold">Tarefas Vinculadas</h3>
                <div className="space-y-2">
                  {goal.assigned_tasks.map((taskId, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted/20 rounded">
                      <Checkbox />
                      <span className="text-sm">Tarefa {index + 1}</span>
                      <Badge variant="outline" className="ml-auto text-xs">
                        Pendente
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notes Section */}
          <div className="glass-card p-4 space-y-3">
            <h3 className="font-semibold">Anotações Pessoais</h3>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione suas anotações sobre o progresso desta meta..."
              className="neon-border min-h-[100px]"
            />
            <Button 
              onClick={handleSaveNotes} 
              size="sm" 
              className="glow-button"
            >
              Salvar Anotações
            </Button>
          </div>

          <Separator />

          {/* Danger Zone */}
          <div className="glass-card p-4 space-y-3 border border-red-500/30">
            <h3 className="font-semibold text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Zona de Risco
            </h3>
            <p className="text-sm text-muted-foreground">
              Esta ação não pode ser desfeita. Isso excluirá permanentemente a meta e todos os dados associados.
            </p>
            
            {!showDeleteConfirm ? (
              <Button 
                variant="destructive" 
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir Meta
              </Button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-medium text-red-400">
                  Tem certeza que deseja excluir esta meta?
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleDelete}
                    className="flex-1"
                  >
                    Confirmar Exclusão
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
