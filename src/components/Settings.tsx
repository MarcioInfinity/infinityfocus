
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  User, 
  Bell, 
  Lock, 
  Upload,
  Save,
  Eye,
  EyeOff,
  Trash2,
  Clock
} from 'lucide-react';
import { useToastNotifications } from '@/hooks/use-toast-notifications';
import { useProfile } from '@/hooks/useProfile';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { getTimezoneOptions } from '@/utils/dateTime';

export function Settings() {
  const { user } = useAuth();
  const { profile, updateProfile, uploadAvatar, removeAvatar, isLoading, isUpdating, isUploading, isRemoving } = useProfile();
  const { settings, updateSettings, isLoading: isLoadingSettings, isUpdating: isUpdatingSettings } = useNotificationSettings();
  const { settings: userSettings, updateSettings: updateUserSettings, isLoading: isLoadingUserSettings, isUpdating: isUpdatingUserSettings } = useUserSettings();
  
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

  // Local states for form data
  const [profileForm, setProfileForm] = useState({
    name: profile?.name || '',
    email: profile?.email || ''
  });

  const [notificationForm, setNotificationForm] = useState({
    tasks_enabled: settings?.tasks_enabled ?? true,
    projects_enabled: settings?.projects_enabled ?? true,
    goals_enabled: settings?.goals_enabled ?? true,
    app_notifications: settings?.app_notifications ?? true,
    email_notifications: settings?.email_notifications ?? false,
    quiet_hours_enabled: settings?.quiet_hours_enabled ?? false,
    quiet_start_time: settings?.quiet_start_time ?? '22:00',
    quiet_end_time: settings?.quiet_end_time ?? '08:00',
    quiet_days: settings?.quiet_days ?? []
  });

  const [userSettingsForm, setUserSettingsForm] = useState({
    timezone: userSettings?.timezone || 'America/Sao_Paulo',
    date_format: userSettings?.date_format || 'DD/MM/YYYY',
    time_format: userSettings?.time_format || '24h'
  });

  // Update form when data loads
  React.useEffect(() => {
    if (profile) {
      setProfileForm({
        name: profile.name,
        email: profile.email
      });
    }
  }, [profile]);

  React.useEffect(() => {
    if (settings) {
      setNotificationForm({
        tasks_enabled: settings.tasks_enabled,
        projects_enabled: settings.projects_enabled,
        goals_enabled: settings.goals_enabled,
        app_notifications: settings.app_notifications,
        email_notifications: settings.email_notifications,
        quiet_hours_enabled: settings.quiet_hours_enabled,
        quiet_start_time: settings.quiet_start_time || '22:00',
        quiet_end_time: settings.quiet_end_time || '08:00',
        quiet_days: settings.quiet_days || []
      });
    }
  }, [settings]);

  React.useEffect(() => {
    if (userSettings) {
      setUserSettingsForm({
        timezone: userSettings.timezone || 'America/Sao_Paulo',
        date_format: userSettings.date_format || 'DD/MM/YYYY',
        time_format: userSettings.time_format || '24h'
      });
    }
  }, [userSettings]);

  const handleSaveProfile = () => {
    if (!profileForm.name.trim()) {
      showErrorToast('Erro!', 'O nome é obrigatório');
      return;
    }
    
    updateProfile({ name: profileForm.name });
  };

  const handleSaveNotifications = () => {
    updateSettings(notificationForm);
  };

  const handleSaveUserSettings = () => {
    updateUserSettings(userSettingsForm);
  };

  const handleChangePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      showErrorToast('Erro!', 'As senhas não coincidem');
      return;
    }
    
    if (passwordData.new.length < 6) {
      showErrorToast('Erro!', 'A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.new
      });

      if (error) throw error;
      
      showSuccessToast('Senha alterada!', 'Sua senha foi alterada com sucesso');
      setPasswordData({ current: '', new: '', confirm: '' });
      setIsPasswordModalOpen(false);
    } catch (error) {
      console.error('Error changing password:', error);
      showErrorToast('Erro!', 'Não foi possível alterar a senha');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadAvatar(file);
    }
  };

  const handleRemoveAvatar = () => {
    removeAvatar();
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
    setNotificationForm(prev => ({
      ...prev,
      quiet_days: prev.quiet_days.includes(dayId)
        ? prev.quiet_days.filter(d => d !== dayId)
        : [...prev.quiet_days, dayId]
    }));
  };

  if (isLoading || isLoadingSettings || isLoadingUserSettings) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Configurações
          </h1>
          <p className="text-muted-foreground mt-1">Carregando configurações...</p>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
          <div className="h-32 bg-muted rounded mb-4"></div>
        </div>
      </div>
    );
  }

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
        <TabsList className="grid w-full grid-cols-3 glass-card">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Perfil e Conta
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="datetime" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Data/Hora
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
                  <AvatarImage src={profile?.avatar || ''} />
                  <AvatarFallback className="text-lg bg-primary/20">
                    {(profile?.name || user?.email || 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Label htmlFor="avatar-upload" className="cursor-pointer">
                      <Button 
                        variant="outline" 
                        className="neon-border" 
                        asChild
                        disabled={isUploading}
                      >
                        <span>
                          <Upload className="w-4 h-4 mr-2" />
                          {isUploading ? 'Enviando...' : 'Alterar Foto'}
                        </span>
                      </Button>
                    </Label>
                    {profile?.avatar && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleRemoveAvatar}
                        disabled={isRemoving}
                        className="text-red-400 border-red-400/30 hover:bg-red-400/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isUploading}
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
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                  className="neon-border"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={profile?.email || user?.email || ''}
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

              <Button 
                onClick={handleSaveProfile} 
                className="w-full glow-button"
                disabled={isUpdating}
              >
                <Save className="w-4 h-4 mr-2" />
                {isUpdating ? 'Salvando...' : 'Salvar Perfil'}
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
                    checked={notificationForm.tasks_enabled}
                    onCheckedChange={(checked) => setNotificationForm({...notificationForm, tasks_enabled: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Projetos</Label>
                  <Switch
                    checked={notificationForm.projects_enabled}
                    onCheckedChange={(checked) => setNotificationForm({...notificationForm, projects_enabled: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Metas</Label>
                  <Switch
                    checked={notificationForm.goals_enabled}
                    onCheckedChange={(checked) => setNotificationForm({...notificationForm, goals_enabled: checked})}
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
                    checked={notificationForm.app_notifications}
                    onCheckedChange={(checked) => setNotificationForm({...notificationForm, app_notifications: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Notificar por Email</Label>
                  <Switch
                    checked={notificationForm.email_notifications}
                    onCheckedChange={(checked) => setNotificationForm({...notificationForm, email_notifications: checked})}
                  />
                </div>
              </div>

              <Separator />

              {/* Horário Silencioso */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Não notificar em horários específicos</Label>
                  <Switch
                    checked={notificationForm.quiet_hours_enabled}
                    onCheckedChange={(checked) => setNotificationForm({...notificationForm, quiet_hours_enabled: checked})}
                  />
                </div>

                {notificationForm.quiet_hours_enabled && (
                  <div className="glass-card p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Início</Label>
                        <Input
                          type="time"
                          value={notificationForm.quiet_start_time}
                          onChange={(e) => setNotificationForm({...notificationForm, quiet_start_time: e.target.value})}
                          className="neon-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Fim</Label>
                        <Input
                          type="time"
                          value={notificationForm.quiet_end_time}
                          onChange={(e) => setNotificationForm({...notificationForm, quiet_end_time: e.target.value})}
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
                            variant={notificationForm.quiet_days.includes(day.id) ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleQuietDay(day.id)}
                            className={notificationForm.quiet_days.includes(day.id) ? "glow-button" : "neon-border"}
                          >
                            {day.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Button 
                onClick={handleSaveNotifications} 
                className="w-full glow-button"
                disabled={isUpdatingSettings}
              >
                <Save className="w-4 h-4 mr-2" />
                {isUpdatingSettings ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="datetime" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Configurações de Data e Hora
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Fuso Horário</Label>
                  <Select 
                    value={userSettingsForm.timezone} 
                    onValueChange={(value) => setUserSettingsForm({...userSettingsForm, timezone: value})}
                  >
                    <SelectTrigger className="neon-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-white/20">
                      {getTimezoneOptions().map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Formato da Data</Label>
                  <Select 
                    value={userSettingsForm.date_format} 
                    onValueChange={(value) => setUserSettingsForm({...userSettingsForm, date_format: value})}
                  >
                    <SelectTrigger className="neon-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-white/20">
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Formato da Hora</Label>
                  <Select 
                    value={userSettingsForm.time_format} 
                    onValueChange={(value) => setUserSettingsForm({...userSettingsForm, time_format: value})}
                  >
                    <SelectTrigger className="neon-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-white/20">
                      <SelectItem value="24h">24 horas</SelectItem>
                      <SelectItem value="12h">12 horas (AM/PM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleSaveUserSettings} 
                className="w-full glow-button"
                disabled={isUpdatingUserSettings}
              >
                <Save className="w-4 h-4 mr-2" />
                {isUpdatingUserSettings ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
