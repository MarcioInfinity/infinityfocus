
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
import { useProjects } from '@/hooks/useProjects';
import { useToastNotifications } from '@/hooks/use-toast-notifications';

interface EditProjectModalProps {
  project: any;
  isOpen: boolean;
  onClose: () => void;
}

export function EditProjectModal({ project, isOpen, onClose }: EditProjectModalProps) {
  const { updateProject, isUpdating } = useProjects();
  const { showSuccessToast, showErrorToast } = useToastNotifications();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    priority: 'medium' as const,
    category: 'professional' as const,
    color: '#3B82F6',
    is_shared: false,
    start_date: undefined as Date | undefined,
    due_date: undefined as Date | undefined,
    is_indefinite: false,
    start_time: '',
    end_time: '',
    notifications_enabled: false,
    repeat_enabled: false,
    repeat_type: null as string | null,
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
        repeat_type: project.repeat_type || null,
        repeat_days: project.repeat_days || [],
      });
    }
  }, [project, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      showErrorToast('Nome do projeto é obrigatório');
      return;
    }

    try {
      const updates = {
        name: formData.name,
        description: formData.description,
        priority: formData.priority,
        category: formData.category,
        color: formData.color,
        is_shared: formData.is_shared,
        start_date: formData.start_date ? format(formData.start_date, 'yyyy-MM-dd') : null,
        due_date: formData.due_date ? format(formData.due_date, 'yyyy-MM-dd') : null,
        is_indefinite: formData.is_indefinite,
        start_time: formData.start_time || null,
        end_time: formData.end_time || null,
        notifications_enabled: formData.notifications_enabled,
        repeat_enabled: formData.repeat_enabled,
        repeat_type: formData.repeat_type,
        repeat_days: formData.repeat_days,
      };

      updateProject({ id: project.id, updates });
      onClose();
    } catch (error) {
      console.error('Error updating project:', error);
      showErrorToast('Erro ao atualizar projeto');
    }
  };

  const colors = [
    { name: 'Azul', value: '#3B82F6' },
    { name: 'Verde', value: '#10B981' },
    { name: 'Roxo', value: '#8B5CF6' },
    { name: 'Rosa', value: '#EC4899' },
    { name: 'Amarelo', value: '#F59E0B' },
    { name: 'Vermelho', value: '#EF4444' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Projeto</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Projeto *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Digite o nome do projeto..."
                className="glass-card border-white/20"
                required
              />
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
              <Label htmlFor="color">Cor do Projeto</Label>
              <Select value={formData.color} onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}>
                <SelectTrigger className="glass-card border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/20">
                  {colors.map(color => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: color.value }}
                        />
                        {color.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Digite a descrição do projeto..."
              className="glass-card border-white/20"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.is_shared}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_shared: checked }))}
              />
              <Label>Projeto compartilhado</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.notifications_enabled}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, notifications_enabled: checked }))}
              />
              <Label>Ativar notificações</Label>
            </div>
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
