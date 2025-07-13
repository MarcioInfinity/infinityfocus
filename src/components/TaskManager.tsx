
import { useState } from 'react';
import { Plus, Calendar, Tag, User, Trash2, Edit3, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useGoals } from '@/hooks/useGoals';

const priorityColors = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  high: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
};

const statusColors = {
  todo: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
  'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  review: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
  done: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
};

export function TaskManager() {
  const { tasks, createTask, updateTask, deleteTask, isLoading } = useTasks();
  const { projects } = useProjects();
  const { goals } = useGoals();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    category: 'professional' as const,
    status: 'todo' as const,
    project_id: null as string | null,
    goal_id: null as string | null,
    due_date: '',
    start_date: '',
    start_time: '',
    end_time: '',
    is_indefinite: false,
    notifications_enabled: false,
    tags: [] as string[],
  });

  const handleCreateTask = () => {
    if (!newTask.title.trim()) return;

    createTask({
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      category: newTask.category,
      status: newTask.status,
      project_id: newTask.project_id,
      goal_id: newTask.goal_id,
      due_date: newTask.due_date || null,
      start_date: newTask.start_date || null,
      start_time: newTask.start_time || null,
      end_time: newTask.end_time || null,
      is_indefinite: newTask.is_indefinite,
      notifications_enabled: newTask.notifications_enabled,
      tags: newTask.tags,
    });

    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      category: 'professional',
      status: 'todo',
      project_id: null,
      goal_id: null,
      due_date: '',
      start_date: '',
      start_time: '',
      end_time: '',
      is_indefinite: false,
      notifications_enabled: false,
      tags: [],
    });
    setShowCreateForm(false);
  };

  const handleUpdateTask = (id: string, updates: any) => {
    updateTask({ id, updates });
  };

  const handleDeleteTask = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      deleteTask(id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Tarefas
          </h1>
          <p className="text-muted-foreground mt-1">Carregando tarefas...</p>
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Tarefas
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas tarefas e acompanhe o progresso
          </p>
        </div>
        <Button className="glow-button" onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Tarefa
        </Button>
      </div>

      {/* Create Task Form */}
      {showCreateForm && (
        <Card className="glass-card animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              Criar Nova Tarefa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="task-title">Título da Tarefa</Label>
                <Input
                  id="task-title"
                  placeholder="Digite o título da tarefa..."
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  className="glass-card border-white/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-priority">Prioridade</Label>
                <Select value={newTask.priority} onValueChange={(value: any) => setNewTask(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger className="glass-card border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/20">
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-category">Categoria</Label>
                <Select value={newTask.category} onValueChange={(value: any) => setNewTask(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className="glass-card border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/20">
                    <SelectItem value="professional">Profissional</SelectItem>
                    <SelectItem value="personal">Pessoal</SelectItem>
                    <SelectItem value="health">Saúde</SelectItem>
                    <SelectItem value="finance">Finanças</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="other">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-project">Projeto (Opcional)</Label>
                <Select value={newTask.project_id || 'none'} onValueChange={(value) => setNewTask(prev => ({ ...prev, project_id: value === 'none' ? null : value }))}>
                  <SelectTrigger className="glass-card border-white/20">
                    <SelectValue placeholder="Selecionar projeto..." />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/20">
                    <SelectItem value="none">Nenhum projeto</SelectItem>
                    {projects?.map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-goal">Meta (Opcional)</Label>
                <Select value={newTask.goal_id || 'none'} onValueChange={(value) => setNewTask(prev => ({ ...prev, goal_id: value === 'none' ? null : value }))}>
                  <SelectTrigger className="glass-card border-white/20">
                    <SelectValue placeholder="Selecionar meta..." />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/20">
                    <SelectItem value="none">Nenhuma meta</SelectItem>
                    {goals?.map(goal => (
                      <SelectItem key={goal.id} value={goal.id}>
                        {goal.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-due-date">Data de Vencimento</Label>
                <Input
                  id="task-due-date"
                  type="date"
                  value={newTask.due_date}
                  onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
                  className="glass-card border-white/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-description">Descrição</Label>
              <Textarea
                id="task-description"
                placeholder="Digite a descrição da tarefa..."
                value={newTask.description}
                onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                className="glass-card border-white/20"
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={newTask.notifications_enabled}
                  onCheckedChange={(checked) => setNewTask(prev => ({ ...prev, notifications_enabled: checked }))}
                />
                <Label>Ativar notificações</Label>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowCreateForm(false)} className="neon-border">
                  Cancelar
                </Button>
                <Button className="glow-button" onClick={handleCreateTask}>
                  Criar Tarefa
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tasks List */}
      <div className="space-y-4">
        {!tasks || tasks.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="text-center py-12">
              <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma tarefa encontrada</h3>
              <p className="text-muted-foreground mb-4">
                Crie sua primeira tarefa para começar a organizar seu trabalho
              </p>
              <Button className="glow-button" onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Tarefa
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map(task => (
              <Card key={task.id} className="glass-card">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-lg">{task.title}</CardTitle>
                      <div className="flex gap-2">
                        <Badge className={priorityColors[task.priority]}>
                          {task.priority === 'low' ? 'Baixa' : task.priority === 'medium' ? 'Média' : 'Alta'}
                        </Badge>
                        <Badge className={statusColors[task.status]}>
                          {task.status === 'todo' ? 'A fazer' : 
                           task.status === 'in-progress' ? 'Em progresso' : 
                           task.status === 'review' ? 'Revisão' : 'Concluída'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setEditingTask(task)}>
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteTask(task.id)} 
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {task.description && (
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {task.due_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(task.due_date).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                    {task.notifications_enabled && (
                      <div className="flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Notificações
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateTask(task.id, { 
                        status: task.status === 'done' ? 'todo' : 'done' 
                      })}
                      className="flex-1"
                    >
                      {task.status === 'done' ? (
                        <>
                          <Clock className="w-3 h-3 mr-1" />
                          Reabrir
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Concluir
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Criada em {new Date(task.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </CardContent>
              </Card>
            ))}
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
