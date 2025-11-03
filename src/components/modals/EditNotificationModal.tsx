import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNotifications } from '@/hooks/useNotifications';
import { useTasks } from '@/hooks/useTasks';
import { useToastNotifications } from '@/hooks/use-toast-notifications';
import { NotificationType } from '@/types';

const daysOfWeek = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda' },
  { value: 2, label: 'Terça' },
  { value: 3, label: 'Quarta' },
  { value: 4, label: 'Quinta' },
  { value: 5, label: 'Sexta' },
  { value: 6, label: 'Sábado' }
];

interface EditNotificationModalProps {
  notificationId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditNotificationModal({ notificationId, isOpen, onClose }: EditNotificationModalProps) {
  const { notifications, updateNotification } = useNotifications();
  const { tasks } = useTasks();
  const { showSuccessToast, showErrorToast } = useToastNotifications();
  
  const [formData, setFormData] = useState({
    task_id: null as string | null,
    type: 'time' as NotificationType,
    time: '',
    days_of_week: [] as number[],
    specific_date: '',
    message: '',
    is_active: true
  });

  useEffect(() => {
    if (notificationId && isOpen) {
      const notification = notifications?.find(n => n.id === notificationId);
      if (notification) {
        setFormData({
          task_id: notification.task_id,
          type: notification.type as NotificationType,
          time: notification.time || '',
          days_of_week: notification.days_of_week || [],
          specific_date: notification.specific_date || '',
          message: notification.message,
          is_active: notification.is_active
        });
      }
    }
  }, [notificationId, notifications, isOpen]);

  const handleSubmit = () => {
    if (!notificationId) return;

    // Validate required fields
    if (!formData.message.trim()) {
      showErrorToast('A mensagem é obrigatória');
      return;
    }
    if (formData.type === 'time' && !formData.time) {
      showErrorToast('O horário é obrigatório para notificações por horário');
      return;
    }
    if (formData.type === 'day' && formData.days_of_week.length === 0) {
      showErrorToast('Selecione pelo menos um dia da semana');
      return;
    }
    if (formData.type === 'date' && !formData.specific_date) {
      showErrorToast('A data é obrigatória para notificações por data específica');
      return;
    }

    try {
      updateNotification({
        id: notificationId,
        updates: {
          task_id: formData.task_id,
          type: formData.type,
          time: formData.time || null,
          days_of_week: formData.days_of_week.length > 0 ? formData.days_of_week : null,
          specific_date: formData.specific_date || null,
          message: formData.message,
          is_active: formData.is_active
        }
      });
      showSuccessToast('Notificação atualizada com sucesso!');
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar notificação:', error);
      showErrorToast('Erro ao atualizar notificação. Tente novamente.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Notificação</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="notification-type">Tipo de Notificação</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value: NotificationType) => setFormData(prev => ({
                  ...prev,
                  type: value
                }))}
              >
                <SelectTrigger className="glass-card border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/20">
                  <SelectItem value="time">Por Horário</SelectItem>
                  <SelectItem value="day">Dias da Semana</SelectItem>
                  <SelectItem value="date">Data Específica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-select">Tarefa (Opcional)</Label>
              <Select 
                value={formData.task_id || 'none'} 
                onValueChange={(value) => setFormData(prev => ({
                  ...prev, 
                  task_id: value === 'none' ? null : value
                }))}
              >
                <SelectTrigger className="glass-card border-white/20">
                  <SelectValue placeholder="Selecionar tarefa..." />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/20">
                  <SelectItem value="none">Nenhuma tarefa</SelectItem>
                  {tasks?.map(task => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.type === 'time' && (
              <div className="space-y-2">
                <Label htmlFor="notification-time">Horário</Label>
                <Input 
                  id="notification-time" 
                  type="time" 
                  value={formData.time} 
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    time: e.target.value
                  }))} 
                  className="glass-card border-white/20" 
                />
              </div>
            )}

            {formData.type === 'day' && (
              <div className="space-y-2 md:col-span-2">
                <Label>Dias da Semana</Label>
                <div className="grid grid-cols-2 gap-2">
                  {daysOfWeek.map(day => (
                    <label key={day.value} className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        checked={formData.days_of_week.includes(day.value)} 
                        onChange={e => {
                          const checked = e.target.checked;
                          setFormData(prev => ({
                            ...prev,
                            days_of_week: checked 
                              ? [...prev.days_of_week, day.value] 
                              : prev.days_of_week.filter(d => d !== day.value)
                          }));
                        }} 
                        className="rounded border-white/20" 
                      />
                      <span className="text-sm">{day.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {formData.type === 'date' && (
              <div className="space-y-2">
                <Label htmlFor="notification-date">Data Específica</Label>
                <Input 
                  id="notification-date" 
                  type="date" 
                  value={formData.specific_date} 
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    specific_date: e.target.value
                  }))} 
                  className="glass-card border-white/20" 
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notification-message">Mensagem</Label>
            <Textarea 
              id="notification-message" 
              placeholder="Digite a mensagem da notificação..." 
              value={formData.message} 
              onChange={e => setFormData(prev => ({
                ...prev,
                message: e.target.value
              }))} 
              className="glass-card border-white/20" 
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch 
              checked={formData.is_active} 
              onCheckedChange={checked => setFormData(prev => ({
                ...prev,
                is_active: checked
              }))} 
            />
            <Label>Ativar notificação</Label>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="neon-border"
            >
              Cancelar
            </Button>
            <Button className="glow-button" onClick={handleSubmit}>
              Atualizar Notificação
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
