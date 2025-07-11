
import { useState } from 'react';
import { 
  Bell, 
  Clock, 
  Calendar, 
  CalendarDays, 
  Plus, 
  Settings,
  Trash2,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CustomNotification, NotificationType } from '@/types';

const mockNotifications: CustomNotification[] = [];

const daysOfWeek = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda' },
  { value: 2, label: 'Terça' },
  { value: 3, label: 'Quarta' },
  { value: 4, label: 'Quinta' },
  { value: 5, label: 'Sexta' },
  { value: 6, label: 'Sábado' },
];

export function NotificationManager() {
  const [notifications, setNotifications] = useState<CustomNotification[]>(mockNotifications);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newNotification, setNewNotification] = useState({
    task_id: '',
    type: 'time' as NotificationType,
    time: '',
    days_of_week: [] as number[],
    specific_date: '',
    message: '',
    is_active: true
  });

  const handleCreateNotification = () => {
    // Here we would save to Supabase
    console.log('Creating notification:', newNotification);
    setShowCreateForm(false);
    setNewNotification({
      task_id: '',
      type: 'time',
      time: '',
      days_of_week: [],
      specific_date: '',
      message: '',
      is_active: true
    });
  };

  const toggleNotification = (id: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, is_active: !notif.is_active } : notif
    ));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'time': return Clock;
      case 'day': return CalendarDays;
      case 'date': return Calendar;
    }
  };

  const formatNotificationDetails = (notification: CustomNotification) => {
    switch (notification.type) {
      case 'time':
        return `Horário: ${notification.time}`;
      case 'day':
        return `Dias: ${notification.days_of_week?.map(day => 
          daysOfWeek.find(d => d.value === day)?.label
        ).join(', ')}`;
      case 'date':
        return `Data: ${new Date(notification.specific_date || '').toLocaleDateString('pt-BR')}`;
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Notificações
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure lembretes e notificações para suas tarefas
          </p>
        </div>
        <Button 
          className="glow-button"
          onClick={() => setShowCreateForm(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Notificação
        </Button>
      </div>

      {/* Create Notification Form */}
      {showCreateForm && (
        <Card className="glass-card animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Criar Nova Notificação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="notification-type">Tipo de Notificação</Label>
                <Select
                  value={newNotification.type}
                  onValueChange={(value: NotificationType) => 
                    setNewNotification(prev => ({ ...prev, type: value }))
                  }
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

              {newNotification.type === 'time' && (
                <div className="space-y-2">
                  <Label htmlFor="notification-time">Horário</Label>
                  <Input
                    id="notification-time"
                    type="time"
                    value={newNotification.time}
                    onChange={(e) => setNewNotification(prev => ({ 
                      ...prev, 
                      time: e.target.value 
                    }))}
                    className="glass-card border-white/20"
                  />
                </div>
              )}

              {newNotification.type === 'day' && (
                <div className="space-y-2">
                  <Label>Dias da Semana</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {daysOfWeek.map((day) => (
                      <label key={day.value} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newNotification.days_of_week.includes(day.value)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setNewNotification(prev => ({
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

              {newNotification.type === 'date' && (
                <div className="space-y-2">
                  <Label htmlFor="notification-date">Data Específica</Label>
                  <Input
                    id="notification-date"
                    type="date"
                    value={newNotification.specific_date}
                    onChange={(e) => setNewNotification(prev => ({ 
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
                value={newNotification.message}
                onChange={(e) => setNewNotification(prev => ({ 
                  ...prev, 
                  message: e.target.value 
                }))}
                className="glass-card border-white/20"
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={newNotification.is_active}
                  onCheckedChange={(checked) => setNewNotification(prev => ({ 
                    ...prev, 
                    is_active: checked 
                  }))}
                />
                <Label>Ativar notificação</Label>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateForm(false)}
                  className="neon-border"
                >
                  Cancelar
                </Button>
                <Button 
                  className="glow-button"
                  onClick={handleCreateNotification}
                >
                  Criar Notificação
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="text-center py-12">
              <Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma notificação configurada</h3>
              <p className="text-muted-foreground mb-4">
                Crie notificações para não perder prazos importantes
              </p>
              <Button 
                className="glow-button"
                onClick={() => setShowCreateForm(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Notificação
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notifications.map((notification) => {
              const NotificationIcon = getNotificationIcon(notification.type);
              
              return (
                <Card key={notification.id} className="glass-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <NotificationIcon className="w-5 h-5 text-primary" />
                        <Badge variant={notification.is_active ? 'default' : 'secondary'}>
                          {notification.is_active ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleNotification(notification.id)}
                        >
                          {notification.is_active ? (
                            <Volume2 className="w-4 h-4" />
                          ) : (
                            <VolumeX className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="font-medium">{notification.message}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatNotificationDetails(notification)}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      Criada em {new Date(notification.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <Button 
        className="floating-action animate-glow"
        onClick={() => setShowCreateForm(true)}
      >
        <Plus className="w-6 h-6" />
      </Button>
    </div>
  );
}
