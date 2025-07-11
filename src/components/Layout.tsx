
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { 
  Calendar, 
  CheckSquare, 
  FolderKanban, 
  Settings, 
  Bell, 
  Menu,
  X,
  Plus,
  Target,
  Infinity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Calendar },
  { name: 'Minhas Tarefas', href: '/tasks', icon: CheckSquare },
  { name: 'Metas', href: '/goals', icon: Target },
  { name: 'Projetos', href: '/projects', icon: FolderKanban },
  { name: 'Notificações', href: '/notifications', icon: Bell },
  { name: 'Configurações', href: '/settings', icon: Settings },
];

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="glass-card h-full p-4 border-r border-white/10">
          {/* Logo/Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Infinity className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                INFINITY FOCUS
              </h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 group"
              >
                <item.icon className="w-5 h-5 group-hover:text-primary transition-colors" />
                <span className="font-medium">{item.name}</span>
              </a>
            ))}
          </nav>

          {/* Quick Actions */}
          <div className="mt-8 space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Ações Rápidas
            </h3>
            <Button className="w-full glow-button justify-start" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Nova Tarefa
            </Button>
            <Button variant="outline" className="w-full justify-start neon-border" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Novo Projeto
            </Button>
            <Button variant="outline" className="w-full justify-start neon-border" size="sm">
              <Target className="w-4 h-4 mr-2" />
              Nova Meta
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-4 glass-card border-b border-white/10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">INFINITY FOCUS</h1>
          <div className="w-10" />
        </div>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
