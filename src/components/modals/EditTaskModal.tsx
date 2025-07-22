
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useGoals } from '@/hooks/useGoals';
import { useToastNotifications } from '@/hooks/use-toast-notifications';

interface EditTaskModalProps {
  task: any;
  isOpen: boolean;
  onClose: () => void;
}

export function EditTaskModal({ task, isOpen, onClose }: EditTaskModalProps) {
  const { updateTask, isUpdating } = useTasks();
  const { projects } = useProjects();
  const { goals } = useGoals();
  const { showSuccessToast, showErrorToast } = useToastNotifications();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    category: 'professional' as const,
    status: 'todo' as const,
    project_id: null as string | null,
    goal_id: null as string | null,
    due_date: undefined as Date | undefined,
    start_date: undefined as Date | undefined,
    start_time: '',
    end_time: '',
    is_indefinite: false,
    notifications_enabled: false,
    tags: [] as string[],
  });

  useEffect(() => {
    if (task && isOpen) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        category: task.category || 'professional',
        status: task.status || 'todo',
        project_id: task.project_id || null,
        goal_id: task.goal_id || null,
        due_date: task.due_date ? new Date(task.due_date) : undefined,
        start_date: task.start_date ? new Date(task.start_date) : undefined,
        start_time: task.start_time || '',
        end_time: task.end_time || '',
        is_indefinite: task.is_indefinite || false,
        notifications_enabled: task.notifications_enabled || false,
        tags: task.tags || [],
      });
    }
  }, [task, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      showErrorToast('Título da tarefa é obrigatório');
      return;
    }

    try {
      const updates = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        category: formData.category,
        status: formData.status,
        project_id: formData.project_id,
        goal_id: formData.goal_id,
        due_date: formData.due_date ? format(formData.due_date, 'yyyy-MM-dd') : null,
        start_date: formData.start_date ? format(formData.start_date, 'yyyy-MM-dd') : null,
        start_time: formData.start_time || null,
        end_time: formData.end_time || null,
        is_indefinite: formData.is_indefinite,
        notifications_enabled: formData.notifications_enabled,
        tags: formData.tags,
      };

      updateTask({ id: task.id, updates });
      onClose();
    } catch (error) {
      console.error('Error updating task:', error);
      showErrorToast('Erro ao atualizar tarefa');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Tarefa</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título da Tarefa *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Digite o título da tarefa..."
                className="glass-card border-white/20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger className="glass-card border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/20">
                  <SelectItem value="todo">A fazer</SelectItem>
                  <SelectItem value="in-progress">Em progresso</SelectItem>
                  <SelectItem value="review">Revisão</SelectItem>
                  <SelectItem value="done">Concluída</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select value={formData.priority} onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger className="glass-card border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/20">
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={formData.category} onValueChange={(value: any) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger className="glass-card border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/20">
                  <SelectItem value="professional">Profissional</SelectItem>
                  <SelectItem value="personal">Pessoal</SelectItem>
                  <SelectItem value="health">Saúde</SelectItem>
                  <SelectItem value="finance">Finanças</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="other">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project">Projeto (Opcional)</Label>
              <Select value={formData.project_id || 'none'} onValueChange={(value) => setFormData(prev => ({ ...prev, project_id: value === 'none' ? null : value }))}>
                <SelectTrigger className="glass-card border-white/20">
                  <SelectValue placeholder="Selecionar projeto..." />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/20">
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
              <Label htmlFor="goal">Meta (Opcional)</Label>
              <Select value={formData.goal_id || 'none'} onValueChange={(value) => setFormData(prev => ({ ...prev, goal_id: value === 'none' ? null : value }))}>
                <SelectTrigger className="glass-card border-white/20">
                  <SelectValue placeholder="Selecionar meta..." />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/20">
                  <SelectItem value="none">Nenhuma meta</SelectItem>
                  {goals?.map(goal => (
                    <SelectItem key={goal.id} value={goal.id}>
                      {goal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data de Vencimento</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal glass-card border-white/20",
                      !formData.due_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.due_date ? format(formData.due_date, "dd/MM/yyyy") : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 glass-card border-white/20">
                  <Calendar
                    mode="single"
                    selected={formData.due_date}
                    onSelect={(date) => setFormData(prev => ({ ...prev, due_date: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Data de Início</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal glass-card border-white/20",
                      !formData.start_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.start_date ? format(formData.start_date, "dd/MM/yyyy") : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 glass-card border-white/20">
                  <Calendar
                    mode="single"
                    selected={formData.start_date}
                    onSelect={(date) => setFormData(prev => ({ ...prev, start_date: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Digite a descrição da tarefa..."
              className="glass-card border-white/20"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.notifications_enabled}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, notifications_enabled: checked }))}
            />
            <Label>Ativar notificações</Label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 neon-border">
              Cancelar
            </Button>
            <Button type="submit" disabled={isUpdating} className="flex-1 glow-button">
              {isUpdating ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
