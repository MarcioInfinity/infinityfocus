
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
import { Project, CategoryType, Priority } from '@/types';

interface EditProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: any) => void;
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

const colorOptions = [
  { value: '#3B82F6', label: 'Azul', class: 'bg-blue-500' },
  { value: '#EF4444', label: 'Vermelho', class: 'bg-red-500' },
  { value: '#10B981', label: 'Verde', class: 'bg-green-500' },
  { value: '#F59E0B', label: 'Amarelo', class: 'bg-yellow-500' },
  { value: '#8B5CF6', label: 'Roxo', class: 'bg-purple-500' },
  { value: '#F97316', label: 'Laranja', class: 'bg-orange-500' },
];

const daysOfWeek = [
  { value: '0', label: 'Dom' },
  { value: '1', label: 'Seg' },
  { value: '2', label: 'Ter' },
  { value: '3', label: 'Qua' },
  { value: '4', label: 'Qui' },
  { value: '5', label: 'Sex' },
  { value: '6', label: 'Sáb' },
];

export function EditProjectModal({ project, isOpen, onClose, onSave }: EditProjectModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 'medium' as Priority,
    category: 'professional' as CategoryType,
    color: '#3B82F6',
    is_shared: false,
    start_date: undefined as Date | undefined,
    due_date: undefined as Date | undefined,
    is_indefinite: false,
    start_time: '',
    end_time: '',
    notifications_enabled: false,
    repeat_enabled: false,
    repeat_type: 'daily' as 'daily' | 'weekly' | 'monthly' | 'weekdays' | 'custom',
    repeat_days: [] as string[],
  });

  useEffect(() => {
    if (project && isOpen) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        priority: project.priority || 'medium',
        category: project.category || 'professional',
        color: project.color || '#3B82F6',
        is_shared: project.is_shared || false,
        start_date: project.start_date ? new Date(project.start_date) : undefined,
        due_date: project.due_date ? new Date(project.due_date) : undefined,
        is_indefinite: project.is_indefinite || false,
        start_time: project.start_time || '',
        end_time: project.end_time || '',
        notifications_enabled: project.notifications_enabled || false,
        repeat_enabled: project.repeat_enabled || false,
        repeat_type: project.repeat_type || 'daily',
        repeat_days: project.repeat_days || [],
      });
    }
  }, [project, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    
    const submitData = {
      id: project.id,
      ...formData,
      due_date: formData.due_date ? format(formData.due_date, 'yyyy-MM-dd') : null,
      start_date: formData.start_date ? format(formData.start_date, 'yyyy-MM-dd') : null,
    };
    
    onSave(submitData);
    onClose();
  };

  if (!project) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Projeto</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Digite o nome do projeto"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Digite a descrição do projeto"
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
              <Label>Cor do Projeto</Label>
              <div className="flex gap-2 mt-2">
                {colorOptions.map(color => (
                  <button
                    key={color.value}
                    type="button"
                    className={`w-8 h-8 rounded-full ${color.class} ${formData.color === color.value ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                  />
                ))}
              </div>
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_time">Hora de Início</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="end_time">Hora de Término</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="repeat_enabled"
                  checked={formData.repeat_enabled}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, repeat_enabled: checked }))}
                />
                <Label htmlFor="repeat_enabled">Repetir projeto</Label>
              </div>

              {formData.repeat_enabled && (
                <div className="space-y-4 pl-6 border-l-2 border-muted">
                  <div>
                    <Label>Tipo de Repetição</Label>
                    <Select value={formData.repeat_type} onValueChange={(value: 'daily' | 'weekly' | 'monthly' | 'weekdays' | 'custom') => setFormData(prev => ({ ...prev, repeat_type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Diariamente</SelectItem>
                        <SelectItem value="weekly">Semanalmente</SelectItem>
                        <SelectItem value="monthly">Mensalmente</SelectItem>
                        <SelectItem value="weekdays">Dias da semana</SelectItem>
                        <SelectItem value="custom">Personalizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.repeat_type === 'weekly' && (
                    <div>
                      <Label>Dias da Semana</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {daysOfWeek.map(day => (
                          <Button
                            key={day.value}
                            type="button"
                            variant={formData.repeat_days.includes(day.value) ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              const newDays = formData.repeat_days.includes(day.value)
                                ? formData.repeat_days.filter(d => d !== day.value)
                                : [...formData.repeat_days, day.value];
                              setFormData(prev => ({ ...prev, repeat_days: newDays }));
                            }}
                          >
                            {day.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
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
              <Label htmlFor="is_shared">Projeto compartilhado</Label>
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
