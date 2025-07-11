
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Camera, 
  Lock,
  Mail,
  Smartphone,
  Clock,
  Calendar
} from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

const notificationSchema = z.object({
  notify_tasks: z.boolean(),
  notify_projects: z.boolean(),
  notify_goals: z.boolean(),
  notify_app: z.boolean(),
  notify_email: z.boolean(),
  quiet_hours_start: z.string().optional(),
  quiet_hours_end: z.string().optional(),
});

const weekDays = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' },
];

export function Settings() {
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [quietDays, setQuietDays] = useState<number[]>([]);
  const [profileImage, setProfileImage] = useState<string>('');

  // Mock user data
  const currentUser = {
    name: 'João Silva',
    email: 'joao@exemplo.com',
    avatar: profileImage,
  };

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: currentUser.name,
      email: currentUser.email,
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const notificationForm = useForm<z.infer<typeof notificationSchema>>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      notify_tasks: true,
      notify_projects: true,
      notify_goals: true,
      notify_app: true,
      notify_email: false,
      quiet_hours_start: '22:00',
      quiet_hours_end: '08:00',
    },
  });

  const handleProfileUpdate = (values: z.infer<typeof profileSchema>) => {
    console.log('Updating profile:', values);
    // Aqui seria implementada a atualização do perfil via Supabase
  };

  const handlePasswordChange = (values: z.infer<typeof passwordSchema>) => {
    console.log('Changing password');
    // Aqui seria implementada a mudança de senha via Supabase
    setIsPasswordDialogOpen(false);
    passwordForm.reset();
  };

  const handleNotificationUpdate = (values: z.infer<typeof notificationSchema>) => {
    console.log('Updating notifications:', values, { quietDays });
    // Aqui seria implementada a atualização das configurações de notificação via Supabase
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfileImage(result);
        // Aqui seria implementado o upload da imagem para o Supabase Storage
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleQuietDay = (day: number) => {
    setQuietDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Configurações
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie seu perfil e preferências de notificação
        </p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 glass-card">
          <TabsTrigger value="profile" className="data-[state=active]:glow-button">
            <User className="w-4 h-4 mr-2" />
            Perfil e Conta
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:glow-button">
            <Bell className="w-4 h-4 mr-2" />
            Notificações
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-6 space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informações do Perfil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center space-x-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={profileImage} />
                  <AvatarFallback className="text-2xl">
                    {currentUser.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">{currentUser.name}</h3>
                  <label htmlFor="avatar-upload">
                    <Button size="sm" className="glow-button cursor-pointer" asChild>
                      <span>
                        <Camera className="w-4 h-4 mr-2" />
                        Alterar Foto
                      </span>
                    </Button>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              </div>

              {/* Profile Form */}
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)} className="space-y-4">
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input {...field} className="glass-card border-white/20" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Email
                        </FormLabel>
                        <FormControl>
                          <Input {...field} disabled className="glass-card border-white/20 opacity-50" />
                        </FormControl>
                        <div className="text-sm text-muted-foreground">
                          O email não pode ser alterado
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="glow-button">
                    Salvar Alterações
                  </Button>
                </form>
              </Form>

              {/* Password Change */}
              <div className="pt-6 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-medium flex items-center gap-2">
                      <Lock className="w-5 h-5" />
                      Senha
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Altere sua senha para manter sua conta segura
                    </p>
                  </div>
                  <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="neon-border">
                        Trocar Senha
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="glass-card">
                      <DialogHeader>
                        <DialogTitle>Alterar Senha</DialogTitle>
                      </DialogHeader>
                      <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
                          <FormField
                            control={passwordForm.control}
                            name="currentPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Senha Atual</FormLabel>
                                <FormControl>
                                  <Input {...field} type="password" className="glass-card border-white/20" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={passwordForm.control}
                            name="newPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nova Senha</FormLabel>
                                <FormControl>
                                  <Input {...field} type="password" className="glass-card border-white/20" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={passwordForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Confirmar Nova Senha</FormLabel>
                                <FormControl>
                                  <Input {...field} type="password" className="glass-card border-white/20" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="flex gap-2 pt-4">
                            <Button 
                              type="button" 
                              variant="outline" 
                              className="flex-1 neon-border"
                              onClick={() => setIsPasswordDialogOpen(false)}
                            >
                              Cancelar
                            </Button>
                            <Button type="submit" className="flex-1 glow-button">
                              Alterar Senha
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-6 space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Preferências de Notificação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...notificationForm}>
                <form onSubmit={notificationForm.handleSubmit(handleNotificationUpdate)} className="space-y-6">
                  {/* Notification Types */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium">O que Notificar</h4>
                    
                    <FormField
                      control={notificationForm.control}
                      name="notify_tasks"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 glass-card border-white/20">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Tarefas
                            </FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Receber notificações sobre suas tarefas
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={notificationForm.control}
                      name="notify_projects"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 glass-card border-white/20">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Projetos
                            </FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Receber notificações sobre projetos compartilhados
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={notificationForm.control}
                      name="notify_goals"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 glass-card border-white/20">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Metas
                            </FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Receber notificações sobre progresso das metas
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Notification Methods */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium">Como Notificar</h4>
                    
                    <FormField
                      control={notificationForm.control}
                      name="notify_app"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 glass-card border-white/20">
                          <div className="space-y-0.5">
                            <FormLabel className="flex items-center gap-2 text-base">
                              <Smartphone className="w-4 h-4" />
                              Notificar por App
                            </FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Notificações do navegador (requer autorização)
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={notificationForm.control}
                      name="notify_email"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 glass-card border-white/20">
                          <div className="space-y-0.5">
                            <FormLabel className="flex items-center gap-2 text-base">
                              <Mail className="w-4 h-4" />
                              Notificar por Email
                            </FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Receber notificações importantes por email
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Quiet Hours */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Horário Silencioso
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={notificationForm.control}
                        name="quiet_hours_start"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Início</FormLabel>
                            <FormControl>
                              <Input {...field} type="time" className="glass-card border-white/20" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={notificationForm.control}
                        name="quiet_hours_end"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fim</FormLabel>
                            <FormControl>
                              <Input {...field} type="time" className="glass-card border-white/20" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Quiet Days */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Dias Silenciosos
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Selecione os dias em que não deseja receber notificações
                    </p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {weekDays.map((day) => (
                        <Button
                          key={day.value}
                          type="button"
                          variant={quietDays.includes(day.value) ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleQuietDay(day.value)}
                          className={quietDays.includes(day.value) ? "glow-button" : "neon-border"}
                        >
                          {day.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button type="submit" className="w-full glow-button">
                    Salvar Configurações
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
