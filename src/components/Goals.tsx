import { useState } from 'react';
import { Plus, Target, Calendar, TrendingUp, Edit, Trash2, Eye, MoreHorizontal, CheckCircle, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GoalForm } from './forms/GoalForm';
import { EditGoalModal } from './modals/EditGoalModal';
import { GoalDetailsModal } from './modals/GoalDetailsModal';
import { GoalChecklist } from './GoalChecklist';
import { useGoals } from '@/hooks/useGoals';
import { useToastNotifications } from '@/hooks/use-toast-notifications';

export function Goals() {
  const { goals, createGoal, updateGoal, deleteGoal, isLoading } = useGoals();
  const { showSuccessToast, showErrorToast } = useToastNotifications();
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState('ativas');
  const [filterYear, setFilterYear] = useState<string>('2025');
  const [filterPeriod, setFilterPeriod] = useState<string>('all');

  const handleCreateGoal = (goalData: any) => {
    createGoal(goalData);
    setIsGoalFormOpen(false);
    showSuccessToast('Meta criada com sucesso!');
  };

  const handleEditGoal = (goalData: any) => {
    updateGoal({ id: goalData.id, updates: goalData });
    showSuccessToast('Meta atualizada com sucesso!');
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta meta?')) {
      try {
        await deleteGoal(goalId);
        showSuccessToast('Meta excluída com sucesso!');
      } catch (error) {
        showErrorToast('Erro ao excluir meta');
      }
    }
  };

  const openEditModal = (goal: any) => {
    setSelectedGoal(goal);
    setIsEditModalOpen(true);
  };

  const openDetailsModal = (goal: any) => {
    setSelectedGoal(goal);
    setIsDetailsModalOpen(true);
  };

  const filterGoals = (status: string) => {
    const now = new Date();
    
    switch (status) {
      case 'ativas':
        return goals.filter(goal => goal.progress < 100 && new Date(goal.due_date) >= now);
      case 'concluidas':
        return goals.filter(goal => goal.progress >= 100);
      case 'recompensas':
        // Metas concluídas nos últimos 30 dias
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return goals.filter(goal => 
          goal.progress >= 100 && 
          goal.reward_enabled && 
          new Date(goal.updated_at) >= thirtyDaysAgo
        );
      default:
        return goals;
    }
  };

  const filteredGoals = filterGoals(currentTab);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'professional': return '💼';
      case 'health': return '🏥';
      case 'finance': return '💰';
      case 'relationship': return '❤️';
      case 'intellectual': return '🧠';
      case 'spiritual': return '🙏';
      default: return '🎯';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Metas
            </h1>
            <p className="text-muted-foreground mt-1">Carregando metas...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="glass-card animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-muted rounded w-full mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
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
            Metas
          </h1>
          <p className="text-muted-foreground mt-1">
            Defina e acompanhe suas metas pessoais e profissionais
          </p>
        </div>
        <Dialog open={isGoalFormOpen} onOpenChange={setIsGoalFormOpen}>
          <DialogTrigger asChild>
            <Button className="glow-button">
              <Plus className="w-4 h-4 mr-2" />
              Nova Meta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[75vh] overflow-y-auto" style={{ transform: 'translateY(20%)' }}>
            <GoalForm 
              onSubmit={handleCreateGoal} 
              onCancel={() => setIsGoalFormOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 glass-card">
          <TabsTrigger value="ativas">Ativas</TabsTrigger>
          <TabsTrigger value="concluidas">Concluídas</TabsTrigger>
          <TabsTrigger value="recompensas">Recompensas</TabsTrigger>
        </TabsList>

        <TabsContent value="ativas" className="space-y-4">
          {filteredGoals.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="text-center py-12">
                <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma meta ativa</h3>
                <p className="text-muted-foreground mb-4">
                  Crie sua primeira meta para começar a acompanhar seu progresso
                </p>
                <Dialog open={isGoalFormOpen} onOpenChange={setIsGoalFormOpen}>
                  <DialogTrigger asChild>
                    <Button className="glow-button">
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Primeira Meta
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[75vh] overflow-y-auto" style={{ transform: 'translateY(20%)' }}>
                    <GoalForm 
                      onSubmit={handleCreateGoal} 
                      onCancel={() => setIsGoalFormOpen(false)} 
                    />
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGoals.map(goal => (
                <Card key={goal.id} className="glass-card hover:scale-105 transition-transform">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getCategoryIcon(goal.category)}</span>
                        <div>
                          <CardTitle className="text-lg">{goal.name}</CardTitle>
                          {goal.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {goal.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="glass-card border-white/20">
                          <DropdownMenuItem onClick={() => openDetailsModal(goal)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditModal(goal)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="text-red-400"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Priority Badge */}
                    <Badge variant="outline" className={getPriorityColor(goal.priority)}>
                      {goal.priority === 'high' && '🔴 Alta'}
                      {goal.priority === 'medium' && '🟡 Média'}
                      {goal.priority === 'low' && '🟢 Baixa'}
                    </Badge>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-medium">{Math.round(goal.progress || 0)}%</span>
                      </div>
                      <Progress value={goal.progress || 0} className="h-2" />
                    </div>

                    {/* Dates */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(goal.due_date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      {goal.reward_enabled && (
                        <div className="flex items-center gap-1">
                          <Award className="w-4 h-4 text-yellow-400" />
                          <span>Recompensa</span>
                        </div>
                      )}
                    </div>

                    {/* Checklist Preview */}
                    <GoalChecklist goalId={goal.id} />

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        className="flex-1 glow-button" 
                        size="sm"
                        onClick={() => openDetailsModal(goal)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalhes
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="neon-border"
                        onClick={() => openEditModal(goal)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="concluidas" className="space-y-4">
          <div className="flex gap-4 mb-4">
            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger className="w-32 glass-card border-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-card border-white/20">
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger className="w-40 glass-card border-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-card border-white/20">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="monthly">Mensal</SelectItem>
                <SelectItem value="semester">Semestral</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGoals.map(goal => (
              <Card key={goal.id} className="glass-card opacity-75">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <CardTitle className="text-lg">{goal.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Concluída em {new Date(goal.updated_at).toLocaleDateString('pt-BR')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recompensas" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGoals.map(goal => (
              <Card key={goal.id} className="glass-card border-yellow-500/30">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-400" />
                    <CardTitle className="text-lg">{goal.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {goal.reward_description && (
                    <p className="text-sm text-muted-foreground">
                      <strong>Recompensa:</strong> {goal.reward_description}
                    </p>
                  )}
                  <div className="text-sm text-muted-foreground">
                    Concluída em {new Date(goal.updated_at).toLocaleDateString('pt-BR')}
                  </div>
                  <Button size="sm" className="w-full glow-button">
                    <Award className="w-4 h-4 mr-2" />
                    Resgatar Recompensa
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Floating Action Button */}
      <Dialog open={isGoalFormOpen} onOpenChange={setIsGoalFormOpen}>
        <DialogTrigger asChild>
          <Button className="floating-action animate-glow">
            <Plus className="w-6 h-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[75vh] overflow-y-auto" style={{ transform: 'translateY(20%)' }}>
          <GoalForm 
            onSubmit={handleCreateGoal} 
            onCancel={() => setIsGoalFormOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      {/* Edit Goal Modal */}
      <EditGoalModal
        goal={selectedGoal}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleEditGoal}
      />

      {/* Goal Details Modal */}
      {selectedGoal && (
        <GoalDetailsModal
          goal={selectedGoal}
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          onDelete={handleDeleteGoal}
          onUpdate={handleEditGoal}
        />
      )}
    </div>
  );
}