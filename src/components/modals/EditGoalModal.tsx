
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Goal, CategoryType, Priority } from '@/types';

interface EditGoalModalProps {
  goal: Goal | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (goalData: any) => void;
}

const categoryOptions: { value: CategoryType; label: string; icon: string }[] = [
  { value: 'professional', label: 'Profissional', icon: '💼' },
  { value: 'intellectual', label: 'Intelectual', icon: '🧠' },
  { value: 'finance', label: 'Financeiro', icon: '💰' },
  { value: 'social', label: 'Social', icon: '👥' },
  { value: 'relationship', label: 'Relacionamento', icon: '❤️' },
  { value: 'family', label: 'Família', icon: '👨‍👩‍👧‍👦' },
  { value: 'leisure', label: 'Lazer', icon: '🎮' },
  { value: 'health', label: 'Saúde', icon: '🏥' },
  { value: 'spiritual', label: 'Espiritual', icon: '🙏' },
  { value: 'emotional', label: 'Emocional', icon: '😊' },
  { value: 'other', label: 'Outros', icon: '📋' },
];

const priorityOptions: { value: Priority; label: string; color: string }[] = [
  { value: 'low', label: 'Baixa', color: 'bg-green-500' },
  { value: 'medium', label: 'Média', color: 'bg-yellow-500' },
  { value: 'high', label: 'Alta', color: 'bg-red-500' },
];

export function EditGoalModal({ goal, isOpen, onClose, onSave }: EditGoalModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 'medium' as Priority,
    category: 'professional' as CategoryType,
    progress: 0,
    start_date: undefined as Date | undefined,
    due_date: undefined as Date | undefined,
    is_shared: false,
    notifications_enabled: false,
    reward_enabled: false,
    reward_description: '',
    notes: '',
  });

  useEffect(() => {
    if (goal && isOpen) {
      setFormData({
        name: goal.name || '',
        description: goal.description || '',
        priority: goal.priority || 'medium',
        category: goal.category || 'professional',
        progress: goal.progress || 0,
        start_date: goal.start_date ? new Date(goal.start_date) : undefined,
        due_date: goal.due_date ? new Date(goal.due_date) : undefined,
        is_shared: goal.is_shared || false,
        notifications_enabled: goal.notifications_enabled || false,
        reward_enabled: goal.reward_enabled || false,
        reward_description: goal.reward_description || '',
        notes: goal.notes || '',
      });
    }
  }, [goal, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal) return;
    
    const submitData = {
      id: goal.id,
      ...formData,
      due_date: formData.due_date ? format(formData.due_date, 'yyyy-MM-dd') : null,
      start_date: formData.start_date ? format(formData.start_date, 'yyyy-MM-dd') : null,
    };
    
    onSave(submitData);
    onClose();
  };

  if (!goal) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Meta</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Digite o nome da meta"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Digite a descrição da meta"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Prioridade</Label>
                <Select value={formData.priority} onValueChange={(value: Priority) => setFormData(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${option.color}`} />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Categoria</Label>
                <Select value={formData.category} onValueChange={(value: CategoryType) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <span>{option.icon}</span>
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="progress">Progresso (%)</Label>
              <Input
                id="progress"
                type="number"
                min={0}
                max={100}
                value={formData.progress}
                onChange={(e) => setFormData(prev => ({ ...prev, progress: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data de Início</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !formData.start_date && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.start_date ? format(formData.start_date, "dd/MM/yyyy") : "Selecione a data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.start_date}
                      onSelect={(date) => setFormData(prev => ({ ...prev, start_date: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>Data de Vencimento</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !formData.due_date && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.due_date ? format(formData.due_date, "dd/MM/yyyy") : "Selecione a data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.due_date}
                      onSelect={(date) => setFormData(prev => ({ ...prev, due_date: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Digite suas observações sobre a meta"
                rows={3}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="reward_enabled"
                  checked={formData.reward_enabled}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, reward_enabled: checked }))}
                />
                <Label htmlFor="reward_enabled">Ativar recompensa</Label>
              </div>

              {formData.reward_enabled && (
                <div className="pl-6 border-l-2 border-muted">
                  <Label htmlFor="reward_description">Descrição da Recompensa</Label>
                  <Textarea
                    id="reward_description"
                    value={formData.reward_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, reward_description: e.target.value }))}
                    placeholder="Descreva sua recompensa"
                    rows={2}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="notifications_enabled"
                checked={formData.notifications_enabled}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, notifications_enabled: checked }))}
              />
              <Label htmlFor="notifications_enabled">Ativar notificações</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_shared"
                checked={formData.is_shared}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_shared: checked }))}
              />
              <Label htmlFor="is_shared">Meta compartilhada</Label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              Salvar Alterações
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
