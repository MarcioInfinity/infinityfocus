
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  User, 
  Bell, 
  Lock, 
  Upload,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToastNotifications } from '@/hooks/use-toast-notifications';

export function Settings() {
  const [profileData, setProfileData] = useState({
    name: 'Usuário Demo',
    email: 'usuario@exemplo.com',
    avatar: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    tasks: true,
    projects: true,
    goals: true,
    app_notifications: true,
    email_notifications: false,
    quiet_hours_enabled: false,
    quiet_start: '22:00',
    quiet_end: '08:00',
    quiet_days: []
  });

  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const { showSuccessToast, showErrorToast } = useToastNotifications();

  const handleSaveProfile = () => {
    // Aqui seria integrado com Supabase para salvar dados do perfil
    showSuccessToast('Perfil salvo!', 'Suas informações de perfil foram atualizadas com sucesso');
  };

  const handleSaveNotifications = () => {
    // Aqui seria integrado com Supabase para salvar configurações de notificação
    showSuccessToast('Configurações salvas!', 'Suas preferências de notificação foram atualizadas');
  };

  const handleChangePassword = () => {
    if (passwordData.new !== passwordData.confirm) {
      showErrorToast('Erro!', 'As senhas não coincidem');
      return;
    }
    
    if (passwordData.new.length < 6) {
      showErrorToast('Erro!', 'A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    // Aqui seria integrado com Supabase para alterar senha
    showSuccessToast('Senha alterada!', 'Sua senha foi alterada com sucesso');
    setPasswordData({ current: '', new: '', confirm: '' });
    setIsPasswordModalOpen(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Aqui seria integrado com Supabase Storage para upload da imagem
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData({ ...profileData, avatar: e.target?.result as string });
        showSuccessToast('Foto atualizada!', 'Sua foto de perfil foi atualizada');
      };
      reader.readAsDataURL(file);
    }
  };

  const weekDays = [
    { id: 'monday', label: 'Segunda' },
    { id: 'tuesday', label: 'Terça' },
    { id: 'wednesday', label: 'Quarta' },
    { id: 'thursday', label: 'Quinta' },
    { id: 'friday', label: 'Sexta' },
    { id: 'saturday', label: 'Sábado' },
    { id: 'sunday', label: 'Domingo' }
  ];

  const toggleQuietDay = (dayId: string) => {
    setNotificationSettings(prev => ({
      ...prev,
      quiet_days: prev.quiet_days.includes(dayId)
        ? prev.quiet_days.filter(d => d !== dayId)
        : [...prev.quiet_days, dayId]
    }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Configurações
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie suas preferências e configurações da conta
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 glass-card">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Perfil e Conta
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notificações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informações do Perfil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={profileData.avatar} />
                  <AvatarFallback className="text-lg bg-primary/20">
                    {profileData.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Label htmlFor="avatar-upload" className="cursor-pointer">
                    <Button variant="outline" className="neon-border" asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        Alterar Foto
                      </span>
                    </Button>
                  </Label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG ou GIF (máx. 2MB)
                  </p>
                </div>
              </div>

              <Separator />

              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  className="neon-border"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={profileData.email}
                  disabled
                  className="bg-muted/50"
                />
                <p className="text-xs text-muted-foreground">
                  O email não pode ser alterado por questões de segurança
                </p>
              </div>

              {/* Senha */}
              <div className="space-y-2">
                <Label>Senha</Label>
                <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="neon-border">
                      <Lock className="w-4 h-4 mr-2" />
                      Trocar Senha
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass-card">
                    <DialogHeader>
                      <DialogTitle>Alterar Senha</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Senha Atual</Label>
                        <div className="relative">
                          <Input
                            type={showPassword.current ? "text" : "password"}
                            value={passwordData.current}
                            onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                            className="neon-border pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 -translate-y-1/2"
                            onClick={() => setShowPassword({...showPassword, current: !showPassword.current})}
                          >
                            {showPassword.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Nova Senha</Label>
                        <div className="relative">
                          <Input
                            type={showPassword.new ? "text" : "password"}
                            value={passwordData.new}
                            onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                            className="neon-border pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 -translate-y-1/2"
                            onClick={() => setShowPassword({...showPassword, new: !showPassword.new})}
                          >
                            {showPassword.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Confirmar Nova Senha</Label>
                        <div className="relative">
                          <Input
                            type={showPassword.confirm ? "text" : "password"}
                            value={passwordData.confirm}
                            onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                            className="neon-border pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 -translate-y-1/2"
                            onClick={() => setShowPassword({...showPassword, confirm: !showPassword.confirm})}
                          >
                            {showPassword.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button 
                          variant="outline" 
                          onClick={() => setIsPasswordModalOpen(false)}
                          className="flex-1"
                        >
                          Cancelar
                        </Button>
                        <Button 
                          onClick={handleChangePassword}
                          className="flex-1 glow-button"
                        >
                          Alterar Senha
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Button onClick={handleSaveProfile} className="w-full glow-button">
                <Save className="w-4 h-4 mr-2" />
                Salvar Perfil
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Preferências de Notificação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tipos de Notificação */}
              <div className="space-y-4">
                <h3 className="font-medium">O que notificar</h3>
                
                <div className="flex items-center justify-between">
                  <Label>Tarefas</Label>
                  <Switch
                    checked={notificationSettings.tasks}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, tasks: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Projetos</Label>
                  <Switch
                    checked={notificationSettings.projects}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, projects: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Metas</Label>
                  <Switch
                    checked={notificationSettings.goals}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, goals: checked})}
                  />
                </div>
              </div>

              <Separator />

              {/* Métodos de Notificação */}
              <div className="space-y-4">
                <h3 className="font-medium">Como notificar</h3>
                
                <div className="flex items-center justify-between">
                  <Label>Notificar por App</Label>
                  <Switch
                    checked={notificationSettings.app_notifications}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, app_notifications: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Notificar por Email</Label>
                  <Switch
                    checked={notificationSettings.email_notifications}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, email_notifications: checked})}
                  />
                </div>
              </div>

              <Separator />

              {/* Horário Silencioso */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Não notificar em horários específicos</Label>
                  <Switch
                    checked={notificationSettings.quiet_hours_enabled}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, quiet_hours_enabled: checked})}
                  />
                </div>

                {notificationSettings.quiet_hours_enabled && (
                  <div className="glass-card p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Início</Label>
                        <Input
                          type="time"
                          value={notificationSettings.quiet_start}
                          onChange={(e) => setNotificationSettings({...notificationSettings, quiet_start: e.target.value})}
                          className="neon-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Fim</Label>
                        <Input
                          type="time"
                          value={notificationSettings.quiet_end}
                          onChange={(e) => setNotificationSettings({...notificationSettings, quiet_end: e.target.value})}
                          className="neon-border"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Dias da semana para não notificar</Label>
                      <div className="flex flex-wrap gap-2">
                        {weekDays.map((day) => (
                          <Button
                            key={day.id}
                            variant={notificationSettings.quiet_days.includes(day.id) ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleQuietDay(day.id)}
                            className={notificationSettings.quiet_days.includes(day.id) ? "glow-button" : "neon-border"}
                          >
                            {day.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Button onClick={handleSaveNotifications} className="w-full glow-button">
                <Save className="w-4 h-4 mr-2" />
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
