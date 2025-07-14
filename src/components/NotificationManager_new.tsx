import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, BellOff, Settings } from 'lucide-react';
import { useToastNotifications } from '@/hooks/use-toast-notifications';

interface NotificationManagerProps {
  onPermissionChange?: (granted: boolean) => void;
}

export function NotificationManager({ onPermissionChange }: NotificationManagerProps) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isEnabled, setIsEnabled] = useState(false);
  const { showSuccessToast, showErrorToast } = useToastNotifications();

  useEffect(() => {
    // Verificar permissão atual
    if ('Notification' in window) {
      setPermission(Notification.permission);
      setIsEnabled(Notification.permission === 'granted');
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      showErrorToast('Este navegador não suporta notificações');
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        setIsEnabled(true);
        showSuccessToast('Permissão para notificações concedida!');
        onPermissionChange?.(true);
        
        // Enviar notificação de teste
        new Notification('Infinity Focus', {
          body: 'Notificações ativadas com sucesso!',
          icon: '/favicon.ico',
          tag: 'test-notification'
        });
      } else {
        setIsEnabled(false);
        showErrorToast('Permissão para notificações negada');
        onPermissionChange?.(false);
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      showErrorToast('Erro ao solicitar permissão para notificações');
    }
  };

  const toggleNotifications = () => {
    if (permission === 'granted') {
      setIsEnabled(!isEnabled);
      if (!isEnabled) {
        showSuccessToast('Notificações ativadas');
      } else {
        showSuccessToast('Notificações desativadas');
      }
    } else {
      requestPermission();
    }
  };

  const sendTestNotification = () => {
    if (permission === 'granted' && isEnabled) {
      new Notification('Teste - Infinity Focus', {
        body: 'Esta é uma notificação de teste!',
        icon: '/favicon.ico',
        tag: 'test-notification',
        requireInteraction: false
      });
      showSuccessToast('Notificação de teste enviada!');
    } else {
      showErrorToast('Permissão necessária para enviar notificações');
    }
  };

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return { text: 'Permitido', color: 'text-green-500' };
      case 'denied':
        return { text: 'Negado', color: 'text-red-500' };
      default:
        return { text: 'Não solicitado', color: 'text-yellow-500' };
    }
  };

  const status = getPermissionStatus();

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notificações do Navegador
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base">Status das Notificações</Label>
            <p className={`text-sm ${status.color}`}>{status.text}</p>
          </div>
          <div className="flex items-center space-x-2">
            {permission === 'granted' ? (
              <Bell className="w-5 h-5 text-green-500" />
            ) : (
              <BellOff className="w-5 h-5 text-gray-500" />
            )}
          </div>
        </div>

        {permission === 'granted' && (
          <div className="flex items-center justify-between">
            <Label htmlFor="notifications-toggle">Ativar Notificações</Label>
            <Switch
              id="notifications-toggle"
              checked={isEnabled}
              onCheckedChange={toggleNotifications}
            />
          </div>
        )}

        <div className="flex gap-2">
          {permission !== 'granted' && (
            <Button onClick={requestPermission} className="glow-button">
              <Bell className="w-4 h-4 mr-2" />
              Permitir Notificações
            </Button>
          )}
          
          {permission === 'granted' && isEnabled && (
            <Button onClick={sendTestNotification} variant="outline" className="neon-border">
              <Settings className="w-4 h-4 mr-2" />
              Testar Notificação
            </Button>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          <p>
            As notificações ajudam você a se manter atualizado sobre suas tarefas e projetos,
            mesmo quando não estiver usando o aplicativo.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Hook para usar notificações do navegador
export function useNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    setIsSupported('Notification' in window);
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (permission === 'granted' && isSupported) {
      return new Notification(title, {
        icon: '/favicon.ico',
        ...options
      });
    }
    return null;
  };

  const sendTaskNotification = (taskTitle: string, message: string) => {
    return sendNotification(`Tarefa: ${taskTitle}`, {
      body: message,
      tag: 'task-notification',
      requireInteraction: true
    });
  };

  const sendProjectNotification = (projectName: string, message: string) => {
    return sendNotification(`Projeto: ${projectName}`, {
      body: message,
      tag: 'project-notification',
      requireInteraction: true
    });
  };

  return {
    isSupported,
    permission,
    sendNotification,
    sendTaskNotification,
    sendProjectNotification
  };
}

