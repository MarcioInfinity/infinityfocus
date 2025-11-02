import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Target, 
  Calendar as CalendarIcon, 
  Clock,
  Bell,
  Gift,
  Share2,
  Users,
  Plus,
  FolderOpen,
  CheckSquare
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Goal } from '@/types';
import { GoalChecklist } from '@/components/GoalChecklist';

const goalSchema = z.object({
  name: z.string().min(1, 'Nome da meta é obrigatório'),
  priority: z.enum(['low', 'medium', 'high']),
  category: z.string(),
  custom_category: z.string().optional(),
  is_shared: z.boolean(),
  start_date: z.date({ required_error: 'Data de início é obrigatória' }),
  due_date: z.date({ required_error: 'Data de término é obrigatória' }),
  time: z.string().optional(),
  notify_enabled: z.boolean(),
  reward_enabled: z.boolean(),
  reward_description: z.string().optional(),
  repeat_enabled: z.boolean(),
  repeat_type: z.enum(['daily', 'weekly', 'monthly', 'custom']).optional(),
  repeat_days: z.array(z.number()).optional(),
  monthly_day: z.number().min(1).max(31).optional(),
  custom_dates: z.array(z.date()).optional(),
  description: z.string().optional(),
});

const categories = [
  { value: 'professional', label: 'Profissional' },
  { value: 'intellectual', label: 'Intelectual' },
  { value: 'finance', label: 'Finanças' },
  { value: 'social', label: 'Social' },
  { value: 'relationship', label: 'Relacionamento' },
  { value: 'family', label: 'Família' },
  { value: 'leisure', label: 'Lazer' },
  { value: 'health', label: 'Saúde' },
  { value: 'spiritual', label: 'Espiritual' },
  { value: 'emotional', label: 'Emocional' },
  { value: 'other', label: 'Outros' },
  { value: 'custom', label: 'Personalizada' },
];

const frequencyOptions = [
  { value: 'daily', label: 'Diariamente' },
  { value: 'weekly', label: 'Semanalmente' },
  { value: 'monthly', label: 'Mensalmente' },
  { value: 'custom', label: 'Personalizado' },
];

const weekDays = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Seg' },
  { value: 2, label: 'Ter' },
  { value: 3, label: 'Qua' },
  { value: 4, label: 'Qui' },
  { value: 5, label: 'Sex' },
  { value: 6, label: 'Sáb' },
];

interface GoalFormProps {
  onSubmit: (data: Goal) => void;
  onCancel: () => void;
  initialData?: Goal;
  defaultProjectId?: string;
}

export function GoalForm({ onSubmit, onCancel, initialData }: GoalFormProps) {
  const [showCustomCategory, setShowCustomCategory] = useState(initialData?.custom_category ? true : false);
  const [shareEmails, setShareEmails] = useState<string[]>(initialData?.share_emails || []);
  const [newEmail, setNewEmail] = useState("");
  const [selectedProjects, setSelectedProjects] = useState<string[]>(initialData?.assigned_projects || []);
  const [selectedTasks, setSelectedTasks] = useState<string[]>(initialData?.assigned_tasks || []);
  const [showNewProject, setShowNewProject] = useState(false);
  const [showNewTask, setShowNewTask] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newTaskName, setNewTaskName] = useState("");

  const form = useForm<z.infer<typeof goalSchema>>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: initialData?.name || "",
      priority: initialData?.priority || "medium",
      category: initialData?.category || "professional",
      custom_category: initialData?.custom_category || "",
      is_shared: initialData?.is_shared || false,
      start_date: initialData?.start_date ? new Date(initialData.start_date) : undefined,
      due_date: initialData?.due_date ? new Date(initialData.due_date) : undefined,
      time: initialData?.time || "",
      notify_enabled: initialData?.notify_enabled || false,
      reward_enabled: initialData?.reward_enabled || false,
      reward_description: initialData?.reward_description || "",
      repeat_enabled: initialData?.repeat_enabled || false,
      repeat_type: initialData?.repeat_type || "daily",
      repeat_days: initialData?.repeat_days?.map(day => parseInt(day)) || [],
      description: initialData?.description || "",
    },
  });

  const watchIsShared = form.watch("is_shared");
  const watchRewardEnabled = form.watch("reward_enabled");
  const watchRepeatEnabled = form.watch("repeat_enabled");
  const watchRepeatType = form.watch("repeat_type");
  const watchCategory = form.watch("category");

  const addEmail = () => {
    if (newEmail.trim() && !shareEmails.includes(newEmail.trim())) {
      setShareEmails([...shareEmails, newEmail.trim()]);
      setNewEmail("");
    }
  };

  const removeEmail = (email: string) => {
    setShareEmails(shareEmails.filter(e => e !== email));
  };

  const addNewProject = () => {
    if (newProjectName.trim()) {
      setSelectedProjects([...selectedProjects, newProjectName.trim()]);
      setNewProjectName("");
      setShowNewProject(false);
    }
  };

  const addNewTask = () => {
    if (newTaskName.trim()) {
      setSelectedTasks([...selectedTasks, newTaskName.trim()]);
      setNewTaskName("");
      setShowNewTask(false);
    }
  };

  const removeProject = (project: string) => {
    setSelectedProjects(selectedProjects.filter(p => p !== project));
  };

  const removeTask = (task: string) => {
    setSelectedTasks(selectedTasks.filter(t => t !== task));
  };

  const generateShareLink = () => {
    return `https://infinityfocus.app/shared-goal/${Date.now()}`;
  };

  const handleSubmit = (values: z.infer<typeof goalSchema>) => {
    const goalData = {
      id: initialData?.id || '',
      progress: initialData?.progress || 0,
      notifications_enabled: initialData?.notifications_enabled || false,
      checklist: initialData?.checklist || [],
      user_id: initialData?.user_id || '',
      created_by: initialData?.created_by || '',
      created_at: initialData?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...values,
      start_date: values.start_date?.toISOString() || '',
      due_date: values.due_date?.toISOString() || '',
      share_emails: shareEmails,
      share_link: watchIsShared ? generateShareLink() : undefined,
      assigned_projects: selectedProjects,
      assigned_tasks: selectedTasks,
      repeat_days: values.repeat_days?.map(day => day.toString()) || [],
    };
    onSubmit(goalData as Goal);
  };

  return (
    <Card className="glass-card w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <Target className="w-6 h-6" />
          {initialData ? "Editar Meta" : "Nova Meta"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Nome da Meta */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Meta</FormLabel>
                  <FormControl>
                    <Input {...field} className="glass-card border-white/20" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Prioridade */}
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridade</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="glass-card border-white/20">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="glass-card border-white/20">
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Categoria */}
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          setShowCustomCategory(value === "custom");
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="glass-card border-white/20">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="glass-card border-white/20">
                          {categories.map(cat => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {showCustomCategory && (
                  <FormField
                    control={form.control}
                    name="custom_category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria Personalizada</FormLabel>
                        <FormControl>
                          <Input {...field} className="glass-card border-white/20" placeholder="Digite sua categoria..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>

            {/* Compartilhado */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="is_shared"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 glass-card border-white/20">
                    <div className="space-y-0.5">
                      <FormLabel className="flex items-center gap-2 text-base">
                        <Share2 className="w-4 h-4" />
                        Compartilhado
                      </FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Permitir que outras pessoas vejam o progresso desta meta
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

              {watchIsShared && (
                <div className="space-y-4 p-4 glass-card rounded-lg border border-white/10">
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={generateShareLink()}
                        readOnly
                        className="glass-card border-white/20 text-sm"
                      />
                      <Button
                        type="button"
                        size="sm"
                        className="glow-button"
                        onClick={() => navigator.clipboard.writeText(generateShareLink())}
                      >
                        Copiar Link
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="Convidar por email..."
                        className="glass-card border-white/20"
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addEmail())}
                      />
                      <Button type="button" onClick={addEmail} size="sm" className="glow-button">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {shareEmails.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {shareEmails.map((email) => (
                          <div key={email} className="flex items-center gap-1 px-2 py-1 bg-primary/20 rounded-md text-sm">
                            <Users className="w-3 h-3" />
                            {email}
                            <button
                              type="button"
                              onClick={() => removeEmail(email)}
                              className="ml-1 text-red-400 hover:text-red-300"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Datas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Início</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={`w-full glass-card border-white/20 justify-start text-left font-normal ${!field.value && "text-muted-foreground"}`}
                          >
                            {field.value ? format(field.value, "PPP", { locale: ptBR }) : "Selecionar data"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 glass-card border-white/20">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Término</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={`w-full glass-card border-white/20 justify-start text-left font-normal ${!field.value && "text-muted-foreground"}`}
                          >
                            {field.value ? format(field.value, "PPP", { locale: ptBR }) : "Selecionar data"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 glass-card border-white/20">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Horário */}
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Horário
                  </FormLabel>
                  <FormControl>
                    <Input {...field} type="time" className="glass-card border-white/20" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notificações */}
            <FormField
              control={form.control}
              name="notify_enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 glass-card border-white/20">
                  <div className="space-y-0.5">
                    <FormLabel className="flex items-center gap-2 text-base">
                      <Bell className="w-4 h-4" />
                      Notificar
                    </FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Receber notificações de progresso desta meta
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

            {/* Frequência */}
            <FormField
              control={form.control}
              name="repeat_enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 glass-card border-white/20">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Repetir Meta</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Configurar repetição automática
                    </div>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            {watchRepeatEnabled && (
              <div className="space-y-4 border rounded-lg p-4">
                <FormField
                  control={form.control}
                  name="repeat_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequência</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a frequência" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {frequencyOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Seleção de Dias da Semana */}
                {(watchRepeatType === "weekly" || watchRepeatType === "custom") && (
                  <FormField
                    control={form.control}
                    name="repeat_days"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dias da Semana</FormLabel>
                        <div className="flex flex-wrap gap-2">
                          {weekDays.map((day) => (
                            <div key={day.value} className="flex items-center space-x-2">
                              <Checkbox
                                id={`day-${day.value}`}
                                checked={field.value?.includes(day.value) || false}
                                onCheckedChange={(checked) => {
                                  const currentDays = field.value || [];
                                  if (checked) {
                                    field.onChange([...currentDays, day.value]);
                                  } else {
                                    field.onChange(currentDays.filter(d => d !== day.value));
                                  }
                                }}
                              />
                              <Label htmlFor={`day-${day.value}`} className="text-sm">
                                {day.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Repetição Mensal */}
                {watchRepeatType === "monthly" && (
                  <FormField
                    control={form.control}
                    name="monthly_day"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dia do Mês</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Ex: 15"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            min={1}
                            max={31}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Repetição Personalizada - Seleção de Datas */}
                {watchRepeatType === "custom" && (
                  <FormField
                    control={form.control}
                    name="custom_dates"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Datas Personalizadas</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={`w-full pl-3 text-left font-normal ${!field.value || field.value.length === 0 && "text-muted-foreground"}`}
                              >
                                {field.value && field.value.length > 0 ? (
                                  field.value.map((date: Date) => format(date, "PPP", { locale: ptBR })).join(", ")
                                ) : (
                                  <span>Selecionar datas</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="multiple"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}

            {/* Recompensa */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="reward_enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 glass-card border-white/20">
                    <div className="space-y-0.5">
                      <FormLabel className="flex items-center gap-2 text-base">
                        <Gift className="w-4 h-4" />
                        Recompensa
                      </FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Definir uma recompensa ao concluir esta meta
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

              {watchRewardEnabled && (
                <FormField
                  control={form.control}
                  name="reward_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição da Recompensa</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="glass-card border-white/20"
                          placeholder="Ex: Jantar especial, comprar algo para mim..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Atribuir Projetos */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <FolderOpen className="w-4 h-4" />
                  Projetos Vinculados
                </h4>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="neon-border"
                  onClick={() => setShowNewProject(!showNewProject)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Novo Projeto
                </Button>
              </div>

              {showNewProject && (
                <div className="flex gap-2">
                  <Input
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="Nome do novo projeto..."
                    className="glass-card border-white/20"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addNewProject())}
                  />
                  <Button type="button" onClick={addNewProject} size="sm" className="glow-button">
                    Adicionar
                  </Button>
                </div>
              )}

              {selectedProjects.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedProjects.map((project) => (
                    <div key={project} className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 rounded-md text-sm">
                      <FolderOpen className="w-3 h-3" />
                      {project}
                      <button
                        type="button"
                        onClick={() => removeProject(project)}
                        className="ml-1 text-red-400 hover:text-red-300"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Atribuir Tarefas */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <CheckSquare className="w-4 h-4" />
                  Tarefas Vinculadas
                </h4>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="neon-border"
                  onClick={() => setShowNewTask(!showNewTask)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Nova Tarefa
                </Button>
              </div>

              {showNewTask && (
                <div className="flex gap-2">
                  <Input
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    placeholder="Nome da nova tarefa..."
                    className="glass-card border-white/20"
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addNewTask())}
                  />
                  <Button type="button" onClick={addNewTask} size="sm" className="glow-button">
                    Adicionar
                  </Button>
                </div>
              )}

              {selectedTasks.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedTasks.map((task) => (
                    <div key={task} className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded-md text-sm">
                      <CheckSquare className="w-3 h-3" />
                      {task}
                      <button
                        type="button"
                        onClick={() => removeTask(task)}
                        className="ml-1 text-red-400 hover:text-red-300"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Descrição */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="glass-card border-white/20" rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Checklist - Only show for editing existing goals */}
            {initialData?.id && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Checklist de Progresso</Label>
                <GoalChecklist goalId={initialData.id} />
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                className="flex-1 neon-border"
                onClick={onCancel}
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1 glow-button">
                {initialData ? "Salvar Alterações" : "Criar Meta"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

