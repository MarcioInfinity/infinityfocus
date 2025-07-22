import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  CalendarIcon,
  Plus,
  X,
  Clock,
  Bell,
  Repeat,
  FolderKanban,
  Target,
  CheckSquare,
  Trash2
} from 'lucide-react';
import { Priority, CategoryType, FrequencyType } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Schema corrigido com validação de horário mais flexível
const taskSchema = z.object({
  title: z.string().min(1, 'Nome da tarefa é obrigatório'),
  priority: z.enum(['low', 'medium', 'high']),
  category: z.string(),
  custom_category: z.string().optional(),
  start_date: z.date().optional(),
  due_date: z.date().optional(),
  is_indefinite: z.boolean(),
  // Validação de horário corrigida - aceita formato HH:mm ou vazio
  time: z.string().optional(),
  notify_enabled: z.boolean(),
  repeat_enabled: z.boolean(),
  repeat_type: z.enum(["daily", "weekly", "monthly", "custom"]).optional(),
  repeat_days: z.array(z.number()).optional(),
  monthly_day: z.number().min(1).max(31).optional(),
  custom_dates: z.array(z.date()).optional(),
  assign_to_project: z.boolean(),
  project_id: z.string().optional(),
  assign_to_goal: z.boolean(),
  goal_id: z.string().optional(),
  description: z.string().optional(),
});

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface TaskFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
  projects?: any[];
  goals?: any[];
  defaultProjectId?: string; // Adicionado para receber o ID do projeto do Kanban
}

const categories = [
  { value: 'professional', label: 'Profissional' },
  { value: 'intellectual', label: 'Intelectual' },
  { value: 'finance', label: 'Finanças' },
  { value: 'social', label: 'Social' },
  { value: 'relationship', label: 'Relacionamento' },
  { value: 'health', label: 'Saúde' },
  { value: 'personal', label: 'Pessoal' },
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

export function TaskForm({ onSubmit, onCancel, initialData, projects = [], goals = [], defaultProjectId }: TaskFormProps) {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(initialData?.checklist || []);
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [showCustomCategory, setShowCustomCategory] = useState(initialData?.category === "custom");

  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: initialData?.title || "",
      priority: initialData?.priority || "medium",
      category: initialData?.category || "professional",
      custom_category: initialData?.custom_category || "",
      start_date: initialData?.start_date ? new Date(initialData.start_date) : undefined,
      due_date: initialData?.due_date ? new Date(initialData.due_date) : undefined,
      is_indefinite: initialData?.is_indefinite || false,
      time: initialData?.time || "",
      notify_enabled: initialData?.notify_enabled || false,
      repeat_enabled: initialData?.repeat_enabled || false,
      repeat_type: initialData?.repeat_type || "daily",
      repeat_days: initialData?.repeat_days?.map(Number) || [],
      monthly_day: initialData?.monthly_day || undefined,
      custom_dates: initialData?.custom_dates?.map((date: string) => new Date(date)) || [],
      // CORREÇÃO: Definir assign_to_project como true e project_id se defaultProjectId for fornecido
      assign_to_project: initialData?.project_id ? true : (!!defaultProjectId || false),
      project_id: initialData?.project_id || defaultProjectId || "",
      assign_to_goal: initialData?.goal_id ? true : false,
      goal_id: initialData?.goal_id || "",
      description: initialData?.description || "",
    },
  });

  // CORREÇÃO: Forçar assign_to_project e project_id se defaultProjectId for fornecido
  useEffect(() => {
    if (defaultProjectId) {
      form.setValue('assign_to_project', true);
      form.setValue('project_id', defaultProjectId);
    }
  }, [defaultProjectId, form]);

  const watchIsIndefinite = form.watch('is_indefinite');
  const watchNotifyEnabled = form.watch('notify_enabled');
  const watchRepeatEnabled = form.watch("repeat_enabled");
  const watchAssignToProject = form.watch('assign_to_project');
  const watchAssignToGoal = form.watch('assign_to_goal');
  const watchCategory = form.watch('category');
  const watchRepeatType = form.watch("repeat_type");

  const addChecklistItem = () => {
    if (newChecklistItem.trim()) {
      const newItem: ChecklistItem = {
        id: Date.now().toString(),
        text: newChecklistItem.trim(),
        completed: false,
      };
      setChecklist([...checklist, newItem]);
      setNewChecklistItem('');
    }
  };

  const removeChecklistItem = (id: string) => {
    setChecklist(checklist.filter(item => item.id !== id));
  };

  const handleSubmit = (values: z.infer<typeof taskSchema>) => {
    const taskData = {
      ...values,
      start_time: values.time || null,
      checklist: checklist,
      repeat_enabled: values.repeat_enabled,
      repeat_type: values.repeat_type || null,
      repeat_days: values.repeat_days?.map(day => day.toString()) || [],
      monthly_day: values.monthly_day || null,
      custom_dates: values.custom_dates?.map(date => date.toISOString()) || [],
    };
    
    delete taskData.time;
    delete taskData.repeat_enabled;
    delete taskData.repeat_type;
    delete taskData.repeat_days;
    delete taskData.monthly_day;
    delete taskData.custom_dates;
    
    onSubmit(taskData);
  };

  return (
    <Card className="glass-card max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <Plus className="w-6 h-6" />
          {initialData ? 'Editar Tarefa' : 'Nova Tarefa'}
        </CardTitle>
      </CardHeader>
      <CardContent className="max-h-[70vh] overflow-y-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Nome da Tarefa */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título da Tarefa *</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o nome da tarefa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Prioridade */}
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prioridade</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a prioridade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">🟢 Baixa</SelectItem>
                      <SelectItem value="medium">🟡 Média</SelectItem>
                      <SelectItem value="high">🔴 Alta</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Categoria */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      setShowCustomCategory(value === 'custom');
                    }} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Categoria Personalizada */}
            {showCustomCategory && (
              <FormField
                control={form.control}
                name="custom_category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Categoria Personalizada</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite o nome da categoria" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Datas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Início</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: ptBR })
                            ) : (
                              <span>Selecionar data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
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
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Vencimento</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                            disabled={watchIsIndefinite}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: ptBR })
                            ) : (
                              <span>Selecionar data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
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

            {/* Tarefa Indefinida */}
            <FormField
              control={form.control}
              name="is_indefinite"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Tarefa Indefinida</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Tarefa sem data de término específica
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

            {/* Horário - Campo corrigido */}
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
                    <Input
                      type="time"
                      placeholder="HH:mm"
                      {...field}
                      value={field.value || ''}
                    />
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
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      Ativar notificações
                    </FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Receber notificações sobre esta tarefa
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

            {/* Repetição */}
            <FormField
              control={form.control}
              name="repeat_enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 glass-card border-white/20">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base flex items-center gap-2">
                      <Repeat className="w-4 h-4" />
                      Repetir
                    </FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Configurar repetição automática da tarefa
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

            {watchRepeatEnabled && (
              <div className="space-y-4 border rounded-lg p-4 glass-card border-white/20">
                <FormField
                  control={form.control}
                  name="repeat_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequência</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="glass-card border-white/20">
                            <SelectValue placeholder="Selecione a frequência" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="glass-card border-white/20">
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
                                id={`task-day-${day.value}`}
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
                              <Label htmlFor={`task-day-${day.value}`} className="text-sm">
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
                            className="glass-card border-white/20"
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
                                className={`w-full pl-3 text-left font-normal glass-card border-white/20 ${!field.value || field.value.length === 0 && "text-muted-foreground"}`}
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
                          <PopoverContent className="w-auto p-0 glass-card border-white/20" align="start">
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

            {/* Checklist */}
            <div className="space-y-4">
              <Label className="text-base flex items-center gap-2">
                <CheckSquare className="w-4 h-4" />
                Checklist
              </Label>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Adicionar item ao checklist..."
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addChecklistItem()}
                />
                <Button type="button" onClick={addChecklistItem} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {checklist.length > 0 && (
                <div className="space-y-2">
                  {checklist.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 p-2 border rounded">
                      <Checkbox
                        checked={item.completed}
                        onCheckedChange={(checked) => {
                          setChecklist(checklist.map(i => 
                            i.id === item.id ? { ...i, completed: checked as boolean } : i
                          ));
                        }}
                      />
                      <span className={item.completed ? 'line-through text-muted-foreground' : ''}>
                        {item.text}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeChecklistItem(item.id)}
                        className="ml-auto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Projeto (Opcional) */}
            {projects.length > 0 && (
              <FormField
                control={form.control}
                name="assign_to_project"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base flex items-center gap-2">
                        <FolderKanban className="w-4 h-4" />
                        Projeto (Opcional)
                      </FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Vincular esta tarefa a um projeto
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        // CORREÇÃO: Desabilitar switch se defaultProjectId estiver presente
                        disabled={!!defaultProjectId}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            {/* Seleção de Projeto */}
            {watchAssignToProject && projects.length > 0 && (
              <FormField
                control={form.control}
                name="project_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Projeto</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      // CORREÇÃO: Desabilitar select se defaultProjectId estiver presente
                      disabled={!!defaultProjectId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um projeto" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Nenhum projeto</SelectItem>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Meta (Opcional) */}
            {goals.length > 0 && (
              <FormField
                control={form.control}
                name="assign_to_goal"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Meta (Opcional)
                      </FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Vincular esta tarefa a uma meta
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
            )}

            {/* Seleção de Meta */}
            {watchAssignToGoal && goals.length > 0 && (
              <FormField
                control={form.control}
                name="goal_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meta</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma meta" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Nenhuma meta</SelectItem>
                        {goals.map((goal) => (
                          <SelectItem key={goal.id} value={goal.id}>
                            {goal.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Descrição */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva os detalhes da tarefa..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Botões */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1">
                {initialData ? 'Atualizar Tarefa' : 'Criar Tarefa'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

