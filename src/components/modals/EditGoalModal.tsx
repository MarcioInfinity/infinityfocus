
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, X } from 'lucide-react';
import { Goal, Priority } from '@/types';

interface EditGoalModalProps {
  goal: Goal;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedGoal: Goal) => void;
}

export function EditGoalModal({ goal, isOpen, onClose, onSave }: EditGoalModalProps) {
  const [formData, setFormData] = useState<Goal>(goal);
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);

  useEffect(() => {
    setFormData(goal);
  }, [goal]);

  const categories = [
    'Profissional', 'Intelectual', 'Finanças', 'Social', 
    'Relacionamento', 'Família', 'Lazer', 'Saúde', 
    'Espiritual', 'Emocional', 'Outros'
  ];

  const handleSave = () => {
    const updatedGoal = {
      ...formData,
      category: showCustomCategory ? customCategory : formData.category,
      updated_at: new Date().toISOString()
    };
    onSave(updatedGoal);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass-card">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Editar Meta
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Nome da Meta */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Meta</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="neon-border"
            />
          </div>

          {/* Prioridade */}
          <div className="space-y-2">
            <Label>Prioridade</Label>
            <Select value={formData.priority} onValueChange={(value: Priority) => setFormData({...formData, priority: value})}>
              <SelectTrigger className="neon-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-card">
                <SelectItem value="low">🟢 Baixa</SelectItem>
                <SelectItem value="medium">🟡 Média</SelectItem>
                <SelectItem value="high">🔴 Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select 
              value={showCustomCategory ? 'custom' : formData.category} 
              onValueChange={(value) => {
                if (value === 'custom') {
                  setShowCustomCategory(true);
                } else {
                  setShowCustomCategory(false);
                  setFormData({...formData, category: value});
                }
              }}
            >
              <SelectTrigger className="neon-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-card">
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
                <SelectItem value="custom">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Personalizada
                </SelectItem>
              </SelectContent>
            </Select>
            {showCustomCategory && (
              <div className="flex gap-2">
                <Input
                  placeholder="Digite a categoria personalizada"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="neon-border"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowCustomCategory(false);
                    setCustomCategory('');
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Compartilhado */}
          <div className="flex items-center justify-between">
            <Label>Compartilhado</Label>
            <Switch
              checked={formData.is_shared}
              onCheckedChange={(checked) => setFormData({...formData, is_shared: checked})}
            />
          </div>

          {/* Datas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data de Início</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start neon-border">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.start_date ? new Date(formData.start_date).toLocaleDateString('pt-BR') : 'Selecionar data'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="glass-card">
                  <Calendar
                    mode="single"
                    selected={formData.start_date ? new Date(formData.start_date) : undefined}
                    onSelect={(date) => setFormData({...formData, start_date: date?.toISOString() || ''})}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Data de Término</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start neon-border">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.due_date ? new Date(formData.due_date).toLocaleDateString('pt-BR') : 'Selecionar data'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="glass-card">
                  <Calendar
                    mode="single"
                    selected={formData.due_date ? new Date(formData.due_date) : undefined}
                    onSelect={(date) => setFormData({...formData, due_date: date?.toISOString() || ''})}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Notificar */}
          <div className="flex items-center justify-between">
            <Label>Notificar</Label>
            <Switch
              checked={formData.notifications_enabled}
              onCheckedChange={(checked) => setFormData({...formData, notifications_enabled: checked})}
            />
          </div>

          {/* Recompensa */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Recompensa</Label>
              <Switch
                checked={formData.reward_enabled}
                onCheckedChange={(checked) => setFormData({...formData, reward_enabled: checked})}
              />
            </div>
            {formData.reward_enabled && (
              <Input
                placeholder="Descreva sua recompensa (ex: tomar um champanhe, comprar algo...)"
                value={formData.reward_description || ''}
                onChange={(e) => setFormData({...formData, reward_description: e.target.value})}
                className="neon-border"
              />
            )}
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="neon-border min-h-[100px]"
              placeholder="Descreva sua meta..."
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1 neon-border">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="flex-1 glow-button">
              Salvar Alterações
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
