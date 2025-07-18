import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToastNotifications } from '@/hooks/use-toast-notifications';
import { useGoals } from '@/hooks/useGoals';
import { Goal, Priority, CategoryType } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { GoalChecklist } from './GoalChecklist';

interface GoalFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  defaultValues?: Partial<Goal>;
}

const priorities = [
  { value: 'low', label: 'Baixa' },
  { value: 'medium', label: 'Média' },
  { value: 'high', label: 'Alta' },
];

const categories = [
  { value: 'professional', label: 'Profissional' },
  { value: 'intellectual', label: 'Intelectual' },
  { value: 'finance', label: 'Financeiro' },
  { value: 'social', label: 'Social' },
  { value: 'relationship', label: 'Relacionamento' },
  { value: 'family', label: 'Família' },
  { value: 'leisure', label: 'Lazer' },
  { value: 'health', label: 'Saúde' },
  { value: 'spiritual', label: 'Espiritual' },
  { value: 'emotional', label: 'Emocional' },
  { value: 'other', label: 'Outro' },
];

function GoalForm({ open, onClose, onSubmit, defaultValues }: GoalFormProps) {
  const [name, setName] = useState(defaultValues?.name || '');
  const [description, setDescription] = useState(defaultValues?.description || '');
  const [priority, setPriority] = useState<Priority>(defaultValues?.priority || 'medium');
  const [category, setCategory] = useState<CategoryType>(defaultValues?.category || 'professional');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, description, priority, category });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{defaultValues ? 'Editar Meta' : 'Nova Meta'}</DialogTitle>
          <DialogDescription>
            Crie e gerencie suas metas de forma eficiente.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nome
            </Label>
            <Input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Descrição
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="priority" className="text-right">
              Prioridade
            </Label>
            <Select value={priority} onValueChange={(value) => setPriority(value as Priority)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione a prioridade" />
              </SelectTrigger>
              <SelectContent>
                {priorities.map((p) => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Categoria
            </Label>
            <Select value={category} onValueChange={(value) => setCategory(value as CategoryType)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function Goals() {
  const { goals, createGoal, updateGoal, deleteGoal, isLoading } = useGoals();
  const { showSuccessToast, showErrorToast } = useToastNotifications();
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const handleCreateGoal = async (goalData: any) => {
    try {
      await createGoal(goalData);
      showSuccessToast('Meta criada com sucesso!');
    } catch (error: any) {
      showErrorToast('Erro ao criar meta: ' + error.message);
    }
  };

  const handleUpdateGoal = async (goalData: any) => {
    if (!editingGoal) return;
    try {
      await updateGoal({ id: editingGoal.id, updates: goalData });
      showSuccessToast('Meta atualizada com sucesso!');
      setEditingGoal(null);
    } catch (error: any) {
      showErrorToast('Erro ao atualizar meta: ' + error.message);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      await deleteGoal(id);
      showSuccessToast('Meta excluída com sucesso!');
    } catch (error: any) {
      showErrorToast('Erro ao excluir meta: ' + error.message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Metas</h2>
        <Button onClick={() => setIsGoalFormOpen(true)} className="glow-button">
          <Plus className="w-4 h-4 mr-2" />
          Nova Meta
        </Button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => (
          <Card key={goal.id} className="goal-card group">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg font-semibold">{goal.name}</CardTitle>
                <div className="flex items-center space-x-2">
                  {goal.priority === 'high' && (
                    <AlertTriangle className="text-red-500 w-4 h-4" />
                  )}
                  <Badge variant="secondary">{goal.category}</Badge>
                </div>
              </div>
              <CardDescription className="text-sm text-muted-foreground line-clamp-2">
                {goal.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Progresso</Label>
                <progress className="w-full h-2 bg-gray-200 rounded" value={goal.progress} max="100"></progress>
                <p className="text-sm text-muted-foreground">
                  {goal.progress}% concluído
                </p>
              </div>

              {/* Add Checklist Component */}
              <GoalChecklist goalId={goal.id} />

              <div className="flex items-center justify-between">
                <Button variant="link">Ver detalhes</Button>
                <div className="space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingGoal(goal)}
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:bg-red-500/10"
                    onClick={() => handleDeleteGoal(goal.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modals and Dialogs */}
      <GoalForm
        open={isGoalFormOpen}
        onClose={() => setIsGoalFormOpen(false)}
        onSubmit={handleCreateGoal}
      />

      {editingGoal && (
        <GoalForm
          open={!!editingGoal}
          onClose={() => setEditingGoal(null)}
          onSubmit={handleUpdateGoal}
          defaultValues={editingGoal}
        />
      )}
    </div>
  );
}
