import { ReactNode, useState } from 'react';
import { Home, CheckSquare, FolderKanban, Target, Bell, Settings, Menu, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner'; // Alterado de '@/components/ui/sonner' para 'sonner'
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [{
  icon: Home,
  label: 'Dashboard',
  path: '/'
}, {
  icon: CheckSquare,
  label: 'Tarefas',
  path: '/tasks'
}, {
  icon: FolderKanban,
  label: 'Projetos',
  path: '/projects'
}, {
  icon: Target,
  label: 'Metas',
  path: '/goals'
}, {
  icon: Bell,
  label: 'Notificações',
  path: '/notifications'
}, {
  icon: Settings,
  label: 'Configurações',
  path: '/settings'
}];

const mobileBottomNavItems = [{
  icon: Home,
  label: 'Dashboard',
  path: '/'
}, {
  icon: CheckSquare,
  label: 'Tarefas',
  path: '/tasks'
}, {
  icon: FolderKanban,
  label: 'Projetos',
  path: '/projects'
}, {
  icon: Target,
  label: 'Metas',
  path: '/goals'
}];

export function Layout({
  children
}: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  // Removido useToastNotifications, agora o Toaster é importado diretamente de 'sonner'
  const {
    user
  } = useAuth();
  const {
    profile
  } = useProfile();
  const isMobile = useIsMobile();
  
  const isActivePath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      // showSuccessToast('Logout realizado com sucesso!'); // Removido, usar toast diretamente
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Mobile Layout
  if (isMobile) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Background Effects */}
        

        {/* Mobile Top Navigation */}
        <div className="fixed top-0 left-0 right-0 z-50 h-14 glass-card border-b border-white/20 flex items-center justify-between px-4">
          {/* Logo à esquerda - CORREÇÃO #4: Logo sem fundo e maior */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <img 
                src="/assets/images/infinity_focus_logo_no_bg.png" 
                alt="Infinity Focus Logo" 
                className="h-8 w-8 object-contain"
              />
            </div>
            <div>
              <h1 className="text-base font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Infinity Focus
              </h1>
              <p className="text-xs text-muted-foreground">Gestão & Produtividade</p>
            </div>
          </div>

          {/* Menu Dropdown à direita */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/notifications')}>
                <Bell className="mr-2 h-4 w-4" />
                Notificações
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-red-400">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Main Content */}
        <div className="pt-14 pb-20 min-h-screen">
          <main className="p-4">
            {children}
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 z-50 h-16 glass-card border-t border-white/20">
          <div className="flex items-center justify-around h-full px-2">
            {mobileBottomNavItems.map(item => {
            const isActive = isActivePath(item.path);
            return <Link key={item.path} to={item.path} className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-white'}`}>
                  <item.icon className={`h-5 w-5 mb-1 ${isActive ? 'text-primary' : ''}`} />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>;
          })}
          </div>
        </div>

        {/* Toast Notifications */}
        <Toaster />
      </div>;
  }

  // Desktop Layout
  return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      

      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="sm" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="glass-card neon-border">
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 z-40 h-full w-64 glass-card border-r border-white/20 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        {/* Logo - CORREÇÃO #4: Logo sem fundo e maior */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 flex items-center justify-center">
              <img 
                src="/assets/images/infinity_focus_logo_no_bg.png" 
                alt="Infinity Focus Logo" 
                className="h-12 w-12 object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Infinity Focus
              </h1>
              <p className="text-xs text-muted-foreground">Gestão & Produtividade</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 flex-1">
          {navItems.map(item => {
          const isActive = isActivePath(item.path);
          return <Link key={item.path} to={item.path} onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive ? 'bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 text-primary glow-text' : 'hover:bg-white/5 text-muted-foreground hover:text-white'}`}>
                <item.icon className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
                <span className="font-medium">{item.label}</span>
              </Link>;
        })}
        </nav>

        {/* User Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={profile?.avatar || ''} />
                <AvatarFallback className="text-sm font-semibold bg-primary/20 text-primary">
                  {(profile?.name || user?.email || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {profile?.name || user?.email || 'Usuário Demo Teste'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {profile?.email || user?.email || 'marcio.pereira.infinity@gmail.com'}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-red-400 hover:bg-red-400/10" title="Sair">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />}

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen">
        <main className="p-4 lg:p-8 pt-16 lg:pt-8">
          {children}
        </main>
      </div>

      {/* Toast Notifications */}
      <Toaster />
    </div>;
}

