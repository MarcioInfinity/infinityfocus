
import { useEffect, useState } from 'react';
import { Bell, X, CheckCircle, AlertTriangle, Info, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToastNotifications } from '@/hooks/use-toast-notifications';
import { cn } from '@/lib/utils';

interface RealtimeNotification {
  id: string;
  type: 'task_due' | 'project_update' | 'goal_progress' | 'reminder' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
}

export function RealtimeNotifications() {
  const { user } = useAuth();
  const { showSuccessToast, showErrorToast } = useToastNotifications();
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Simulate real-time notifications (in a real app, these would come from Supabase realtime)
  useEffect(() => {
    if (!user) return;

    // Subscribe to real-time updates for tasks, projects, and goals
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `created_by=eq.${user.id}`
        },
        (payload) => {
          console.log('Task change detected:', payload);
          
          // Create notification based on the change
          if (payload.eventType === 'INSERT') {
            const newNotification: RealtimeNotification = {
              id: `task-${payload.new.id}`,
              type: 'info',
              title: 'Nova tarefa criada',
              message: `Tarefa "${payload.new.title}" foi criada com sucesso.`,
              timestamp: new Date().toISOString(),
              read: false,
              priority: 'low'
            };
            
            setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
            showSuccessToast(newNotification.message);
          }
          
          if (payload.eventType === 'UPDATE' && payload.new.status === 'done') {
            const newNotification: RealtimeNotification = {
              id: `task-completed-${payload.new.id}`,
              type: 'task_due',
              title: 'Tarefa concluída!',
              message: `Parabéns! Você concluiu a tarefa "${payload.new.title}".`,
              timestamp: new Date().toISOString(),
              read: false,
              priority: 'medium'
            };
            
            setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
            showSuccessToast(newNotification.message);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `owner_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Project change detected:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newNotification: RealtimeNotification = {
              id: `project-${payload.new.id}`,
              type: 'project_update',
              title: 'Novo projeto criado',
              message: `Projeto "${payload.new.name}" foi criado com sucesso.`,
              timestamp: new Date().toISOString(),
              read: false,
              priority: 'medium'
            };
            
            setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'goals',
          filter: `created_by=eq.${user.id}`
        },
        (payload) => {
          console.log('Goal change detected:', payload);
          
          if (payload.eventType === 'UPDATE' && payload.new.progress >= 100) {
            const newNotification: RealtimeNotification = {
              id: `goal-completed-${payload.new.id}`,
              type: 'goal_progress',
              title: 'Meta concluída! 🎉',
              message: `Parabéns! Você atingiu 100% da meta "${payload.new.name}".`,
              timestamp: new Date().toISOString(),
              read: false,
              priority: 'high'
            };
            
            setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
            showSuccessToast(newNotification.message);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Check for overdue tasks periodically
  useEffect(() => {
    if (!user) return;

    const checkOverdueTasks = async () => {
      const { data: overdueTasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('created_by', user.id)
        .neq('status', 'done')
        .lt('due_date', new Date().toISOString().split('T')[0]);

      if (overdueTasks && overdueTasks.length > 0) {
        overdueTasks.forEach(task => {
          const existingNotification = notifications.find(n => n.id === `overdue-${task.id}`);
          if (!existingNotification) {
            const overdueNotification: RealtimeNotification = {
              id: `overdue-${task.id}`,
              type: 'task_due',
              title: 'Tarefa em atraso',
              message: `A tarefa "${task.title}" está em atraso.`,
              timestamp: new Date().toISOString(),
              read: false,
              priority: 'high'
            };
            
            setNotifications(prev => [overdueNotification, ...prev.slice(0, 9)]);
          }
        });
      }
    };

    // Check immediately and then every 5 minutes
    checkOverdueTasks();
    const interval = setInterval(checkOverdueTasks, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user, notifications]);

  const getNotificationIcon = (type: RealtimeNotification['type']) => {
    switch (type) {
      case 'task_due':
        return <Clock className="h-4 w-4" />;
      case 'project_update':
        return <Info className="h-4 w-4" />;
      case 'goal_progress':
        return <CheckCircle className="h-4 w-4" />;
      case 'reminder':
        return <Bell className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: RealtimeNotification['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-400 bg-red-500/20';
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/20';
      default:
        return 'text-blue-400 bg-blue-500/20';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notifications Panel */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-80 max-h-96 overflow-y-auto z-50">
          <Card className="glass-card border-white/20">
            <CardContent className="p-0">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma notificação</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map(notification => (
                    <div
                      key={notification.id}
                      className={cn(
                        'p-3 border-b border-white/10 hover:bg-white/5 transition-colors cursor-pointer',
                        !notification.read && 'bg-primary/5'
                      )}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          'rounded-full p-1 flex-shrink-0',
                          getPriorityColor(notification.priority)
                        )}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm truncate">
                              {notification.title}
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(notification.id);
                              }}
                              className="h-auto p-1 hover:bg-red-500/20"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(notification.timestamp).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
