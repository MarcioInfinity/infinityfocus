
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Task, CategoryType, Priority } from '@/types';
import { useProjects } from '@/hooks/useProjects';
import { useGoals } from '@/hooks/useGoals';

interface EditTaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: any) => void;
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

const daysOfWeek = [
  { value: '0', label: 'Dom' },
  { value: '1', label: 'Seg' },
  { value: '2', label: 'Ter' },
  { value: '3', label: 'Qua' },
  { value: '4', label: 'Qui' },
  { value: '5', label: 'Sex' },
  { value: '6', label: 'Sáb' },
];

export function EditTaskModal({ task, isOpen, onClose, onSave }: EditTaskModalProps) {
  const { projects } = useProjects();
  const { goals } = useGoals();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as Priority,
    category: 'professional' as CategoryType,
    due_date: undefined as Date | undefined,
    start_date: undefined as Date | undefined,
    start_time: '',
    end_time: '',
    is_indefinite: false,
    assigned_to: '',
    project_id: '',
    goal_id: '',
    tags: [] as string[],
    notifications_enabled: false,
    repeat_enabled: false,
    repeat_type: 'daily' as 'daily' | 'weekly' | 'monthly' | 'weekdays' | 'custom',
    repeat_days: [] as string[],
    monthly_day: 1,
    custom_dates: [] as Date[],
  });

  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (task && isOpen) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        category: task.category || 'professional',
        due_date: task.due_date ? new Date(task.due_date) : undefined,
        start_date: task.start_date ? new Date(task.start_date) : undefined,
        start_time: task.start_time || '',
        end_time: task.end_time || '',
        is_indefinite: task.is_indefinite || false,
        assigned_to: task.assigned_to || '',
        project_id: task.project_id || '',
        goal_id: task.goal_id || '',
        tags: task.tags || [],
        notifications_enabled: task.notifications_enabled || false,
        repeat_enabled: task.repeat_enabled || false,
        repeat_type: task.repeat_type || 'daily',
        repeat_days: task.repeat_days || [],
        monthly_day: task.monthly_day || 1,
        custom_dates: task.custom_dates ? task.custom_dates.map(date => new Date(date)) : [],
      });
    }
  }, [task, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;
    
    const submitData = {
      id: task.id,
      ...formData,
      due_date: formData.due_date ? format(formData.due_date, 'yyyy-MM-dd') : null,
      start_date: formData.start_date ? format(formData.start_date, 'yyyy-MM-dd') : null,
      custom_dates: formData.custom_dates.map(date => format(date, 'yyyy-MM-dd')),
    };
    
    onSave(submitData);
    onClose();
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const addCustomDate = (date: Date) => {
    if (!formData.custom_dates.find(d => d.getTime() === date.getTime())) {
      setFormData(prev => ({
        ...prev,
        custom_dates: [...prev.custom_dates, date]
      }));
    }
  };

  const removeCustomDate = (date: Date) => {
    setFormData(prev => ({
      ...prev,
      custom_dates: prev.custom_dates.filter(d => d.getTime() !== date.getTime())
    }));
  };

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Tarefa</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Digite o título da tarefa"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Digite a descrição da tarefa"
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Projeto</Label>
                <Select value={formData.project_id} onValueChange={(value) => setFormData(prev => ({ ...prev, project_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um projeto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum projeto</SelectItem>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Meta</Label>
                <Select value={formData.goal_id} onValueChange={(value) => setFormData(prev => ({ ...prev, goal_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma meta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhuma meta</SelectItem>
                    {goals.map(goal => (
                      <SelectItem key={goal.id} value={goal.id}>
                        {goal.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

            <div>
              <Label>Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Digite uma tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="repeat_enabled"
                  checked={formData.repeat_enabled}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, repeat_enabled: checked }))}
                />
                <Label htmlFor="repeat_enabled">Repetir tarefa</Label>
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

                  {formData.repeat_type === 'monthly' && (
                    <div>
                      <Label htmlFor="monthly_day">Dia do Mês</Label>
                      <Input
                        id="monthly_day"
                        type="number"
                        min={1}
                        max={31}
                        value={formData.monthly_day}
                        onChange={(e) => setFormData(prev => ({ ...prev, monthly_day: parseInt(e.target.value) || 1 }))}
                      />
                    </div>
                  )}

                  {formData.repeat_type === 'custom' && (
                    <div>
                      <Label>Datas Personalizadas</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            Adicionar data
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={undefined}
                            onSelect={(date) => date && addCustomDate(date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.custom_dates.map((date, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {format(date, "dd/MM/yyyy")}
                            <X className="w-3 h-3 cursor-pointer" onClick={() => removeCustomDate(date)} />
                          </Badge>
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
