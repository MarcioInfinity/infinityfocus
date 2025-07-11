
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Infinity, 
  Target, 
  Users, 
  Bell, 
  BarChart3, 
  Calendar, 
  CheckCircle,
  Zap,
  Star,
  Shield
} from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export function Login() {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onLogin = (values: z.infer<typeof loginSchema>) => {
    console.log('Login:', values);
    // Aqui será implementada a autenticação com Supabase
  };

  const onRegister = (values: z.infer<typeof registerSchema>) => {
    console.log('Register:', values);
    // Aqui será implementada a criação de conta com Supabase
    setIsRegisterOpen(false);
  };

  const features = [
    {
      icon: Target,
      title: 'Gestão de Tarefas Inteligente',
      description: 'Organize suas tarefas com categorias personalizadas e prioridades'
    },
    {
      icon: Users,
      title: 'Projetos Colaborativos',
      description: 'Trabalhe em equipe com quadros Kanban e compartilhamento em tempo real'
    },
    {
      icon: BarChart3,
      title: 'Metas e Gamificação',
      description: 'Defina metas, acompanhe progresso e celebre conquistas'
    },
    {
      icon: Bell,
      title: 'Notificações Inteligentes',
      description: 'Receba lembretes personalizados e mantenha-se sempre no foco'
    },
    {
      icon: Calendar,
      title: 'Planejamento Temporal',
      description: 'Gerencie seu tempo com agendamentos e frequências customizáveis'
    },
    {
      icon: Shield,
      title: 'Segurança Total',
      description: 'Seus dados protegidos com criptografia de ponta a ponta'
    }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Welcome */}
          <div className="text-center lg:text-left space-y-8">
            <div className="flex items-center justify-center lg:justify-start space-x-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Infinity className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                INFINITY FOCUS
              </h1>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-3xl lg:text-5xl font-bold text-foreground leading-tight">
                Bem-vindo(a) à
                <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Infinity Focus
                </span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Sua área de gestão do tempo e produtividade!
              </p>
              <p className="text-lg text-muted-foreground max-w-lg">
                Transforme sua produtividade com a ferramenta mais completa para 
                gerenciar tarefas, projetos e metas. Colabore em tempo real e 
                alcance resultados extraordinários.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="glow-button text-lg px-8 py-6">
                    <Star className="w-5 h-5 mr-2" />
                    Começar Agora
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">
                      Criar Conta
                    </DialogTitle>
                  </DialogHeader>
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
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
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" className="glass-card border-white/20" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Senha</FormLabel>
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
                          onClick={() => setIsRegisterOpen(false)}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit" className="flex-1 glow-button">
                          Criar Conta
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Right Side - Login */}
          <div className="flex justify-center">
            <Card className="glass-card w-full max-w-md">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">Fazer Login</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" className="glass-card border-white/20" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha</FormLabel>
                          <FormControl>
                            <Input {...field} type="password" className="glass-card border-white/20" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full glow-button">
                      <Zap className="w-4 h-4 mr-2" />
                      Entrar
                    </Button>
                  </form>
                </Form>
                <div className="text-center mt-4">
                  <p className="text-sm text-muted-foreground">
                    Não tem uma conta?{' '}
                    <button 
                      onClick={() => setIsRegisterOpen(true)}
                      className="text-primary hover:text-accent transition-colors font-medium"
                    >
                      Cadastre-se aqui
                    </button>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl lg:text-4xl font-bold mb-4">
              Por que escolher a{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Infinity Focus?
              </span>
            </h3>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Uma plataforma completa que revoluciona sua forma de trabalhar e organizar sua vida
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="project-card group">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl lg:text-4xl font-bold mb-8">
            Transforme sua{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Produtividade
            </span>
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h4 className="text-xl font-semibold">+300% Produtividade</h4>
              <p className="text-muted-foreground">
                Organize melhor seu tempo e conquiste mais resultados
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-blue-400" />
              </div>
              <h4 className="text-xl font-semibold">Colaboração Total</h4>
              <p className="text-muted-foreground">
                Trabalhe em equipe com eficiência máxima
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center mx-auto">
                <Target className="w-8 h-8 text-purple-400" />
              </div>
              <h4 className="text-xl font-semibold">Metas Alcançadas</h4>
              <p className="text-muted-foreground">
                Sistema de gamificação que motiva conquistas
              </p>
            </div>
          </div>

          <Button 
            size="lg" 
            className="glow-button text-lg px-12 py-6"
            onClick={() => setIsRegisterOpen(true)}
          >
            <Star className="w-5 h-5 mr-2" />
            Comece Sua Transformação Agora
          </Button>
        </div>
      </section>
    </div>
  );
}
