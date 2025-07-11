
import { useState } from 'react';
import { 
  Plus, 
  Filter, 
  Search, 
  Calendar, 
  Flag, 
  User,
  MoreHorizontal,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Task, Priority } from '@/types';

const mockTasks: Task[] = [];

const priorityColors = {
  low: 'bg-green-500/20 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  urgent: 'bg-red-500/20 text-red-400 border-red-500/30'
};

const statusIcons = {
  'todo': Clock,
  'in-progress': AlertCircle,
  'review': User,
  'done': CheckCircle
};

export function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [filter, setFilter] = useState<'all' | 'today' | 'overdue' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    switch (filter) {
      case 'today':
        return task.due_date && new Date(task.due_date).toDateString() === new Date().toDateString();
      case 'overdue':
        return task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';
      case 'completed':
        return task.status === 'done';
      default:
        return true;
    }
  });

  const getPriorityIcon = (priority: Priority) => {
    switch (priority) {
      case 'urgent': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🟢';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Minhas Tarefas
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas tarefas pessoais e mantenha-se produtivo
          </p>
        </div>
        <Button className="glow-button">
          <Plus className="w-4 h-4 mr-2" />
          Nova Tarefa
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tarefas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 glass-card border-white/20"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'today', 'overdue', 'completed'].map((filterOption) => (
            <Button
              key={filterOption}
              variant={filter === filterOption ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(filterOption as any)}
              className={filter === filterOption ? 'glow-button' : 'neon-border'}
            >
              {filterOption === 'all' && 'Todas'}
              {filterOption === 'today' && 'Hoje'}
              {filterOption === 'overdue' && 'Atrasadas'}
              {filterOption === 'completed' && 'Concluídas'}
            </Button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="text-center py-12">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">
                {tasks.length === 0 ? 'Nenhuma tarefa encontrada' : 'Nenhuma tarefa corresponde aos filtros'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {tasks.length === 0 
                  ? 'Comece criando sua primeira tarefa para se manter organizado'
                  : 'Tente ajustar os filtros ou termos de busca'
                }
              </p>
              <Button className="glow-button">
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Tarefa
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map((task) => {
              const StatusIcon = statusIcons[task.status];
              const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';
              
              return (
                <Card key={task.id} className={`task-card ${isOverdue ? 'border-red-500/50' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`w-4 h-4 ${
                          task.status === 'done' ? 'text-green-400' : 
                          task.status === 'in-progress' ? 'text-blue-400' :
                          'text-muted-foreground'
                        }`} />
                        <Badge variant="outline" className={priorityColors[task.priority]}>
                          {getPriorityIcon(task.priority)} {task.priority.toUpperCase()}
                        </Badge>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="glass-card border-white/20">
                          <DropdownMenuItem>Editar</DropdownMenuItem>
                          <DropdownMenuItem>Duplicar</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-400">Excluir</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardTitle className="text-lg">{task.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {task.description && (
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    )}
                    
                    {task.due_date && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span className={isOverdue ? 'text-red-400' : 'text-muted-foreground'}>
                          {new Date(task.due_date).toLocaleDateString('pt-BR')}
                        </span>
                        {isOverdue && <Badge variant="destructive" className="text-xs">Atrasada</Badge>}
                      </div>
                    )}

                    {task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {task.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2">
                      <div className="text-xs text-muted-foreground">
                        Criada em {new Date(task.created_at).toLocaleDateString('pt-BR')}
                      </div>
                      {task.status !== 'done' && (
                        <Button size="sm" className="glow-button">
                          Marcar como Concluída
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <Button className="floating-action animate-pulse-glow">
        <Plus className="w-6 h-6" />
      </Button>
    </div>
  );
}
