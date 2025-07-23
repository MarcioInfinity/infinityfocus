
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X, Clock, Calendar, Repeat } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useGoals } from '@/hooks/useGoals';

interface TaskFormProps {
  onClose: () => void;
}

export function TaskFormWithChecklist({ onClose }: TaskFormProps) {
  const { createTask } = useTasks();
  const { projects } = useProjects();
  const { goals } = useGoals();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    category: 'professional' as const,
    project_id: null as string | null,
    goal_id: null as string | null,
    due_date: '',
    start_date: '',
    start_time: '',
    end_time: '',
    is_indefinite: false,
    notifications_enabled: false,
    repeat_enabled: false,
    repeat_type: 'daily' as 'daily' | 'weekly' | 'monthly' | 'weekdays' | 'custom',
    repeat_interval: 1,
    repeat_days: [] as string[],
    tags: [] as string[],
    checklist: [] as { title: string; completed: boolean }[],
  });

  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [newTag, setNewTag] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const taskData = {
      ...formData,
      repeat_days: formData.repeat_type === 'weekdays' ? ['1', '2', '3', '4', '5'] : 
                   formData.repeat_type === 'custom' ? formData.repeat_days : [],
    };

    createTask(taskData);
    onClose();
  };

  const addChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setFormData(prev => ({
        ...prev,
        checklist: [...prev.checklist, { title: newChecklistItem.trim(), completed: false }]
      }));
      setNewChecklistItem('');
    }
  };

  const removeChecklistItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      checklist: prev.checklist.filter((_, i) => i !== index)
    }));
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

  return (
    <Card className="glass-card animate-slide-up max-h-[90vh] overflow-y-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Criar Nova Tarefa
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título da Tarefa</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="glass-card border-white/20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select value={formData.priority} onValueChange={(value: "low" | "medium" | "high") => setFormData(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger className="glass-card border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="glass-card border-white/20"
            />
          </div>

          {/* Datas e Horários */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="due_date">Data de Vencimento</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                className="glass-card border-white/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_time">Horário</Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                className="glass-card border-white/20"
              />
            </div>
          </div>

          {/* Repetição */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.repeat_enabled}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, repeat_enabled: checked }))}
              />
              <Label className="flex items-center gap-2">
                <Repeat className="w-4 h-4" />
                Repetir tarefa
              </Label>
            </div>

            {formData.repeat_enabled && (
              <div className="space-y-4 pl-6 border-l-2 border-primary/20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de Repetição</Label>
                    <Select value={formData.repeat_type} onValueChange={(value: "daily" | "weekly" | "monthly" | "weekdays" | "custom") => setFormData(prev => ({ ...prev, repeat_type: value }))}>
                      <SelectTrigger className="glass-card border-white/20">
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

                  {formData.repeat_type === 'custom' && (
                    <div className="space-y-2">
                      <Label>Intervalo (dias)</Label>
                      <Input
                        type="number"
                        min="1"
                        value={formData.repeat_interval}
                        onChange={(e) => setFormData(prev => ({ ...prev, repeat_interval: parseInt(e.target.value) || 1 }))}
                        className="glass-card border-white/20"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Checklist */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Checklist</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Adicionar item ao checklist..."
                value={newChecklistItem}
                onChange={(e) => setNewChecklistItem(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addChecklistItem())}
                className="glass-card border-white/20"
              />
              <Button type="button" onClick={addChecklistItem} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {formData.checklist.length > 0 && (
              <div className="space-y-2">
                {formData.checklist.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 glass-card rounded-lg">
                    <span className="flex-1">{item.title}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeChecklistItem(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Vincular a Projeto/Meta */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Projeto (Opcional)</Label>
              <Select value={formData.project_id || 'none'} onValueChange={(value) => setFormData(prev => ({ ...prev, project_id: value === 'none' ? null : value }))}>
                <SelectTrigger className="glass-card border-white/20">
                  <SelectValue placeholder="Selecionar projeto..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum projeto</SelectItem>
                  {projects?.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Meta (Opcional)</Label>
              <Select value={formData.goal_id || 'none'} onValueChange={(value) => setFormData(prev => ({ ...prev, goal_id: value === 'none' ? null : value }))}>
                <SelectTrigger className="glass-card border-white/20">
                  <SelectValue placeholder="Selecionar meta..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma meta</SelectItem>
                  {goals?.map(goal => (
                    <SelectItem key={goal.id} value={goal.id}>
                      {goal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Configurações */}
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.notifications_enabled}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, notifications_enabled: checked }))}
            />
            <Label>Ativar notificações</Label>
          </div>

          {/* Botões */}
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="glow-button flex-1">
              Criar Tarefa
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
