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
import { Priority, CategoryType, FrequencyType, Task, Project, Goal } from '@/types';
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
  onSubmit: (data: Task) => void;
  onCancel: () => void;
  initialData?: Task;
  projects?: Project[];
  goals?: Goal[];
  defaultProjectId?: string; // Adicionado para receber o ID do projeto do Kanban
}


export function TaskForm({ onSubmit, onCancel, initialData, projects, goals, defaultProjectId }: TaskFormProps) {
  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: initialData || {
      title: "",
      priority: "medium",
      category: "",
      is_indefinite: false,
      notify_enabled: true,
      repeat_enabled: false,
      assign_to_project: !!defaultProjectId,
      project_id: defaultProjectId || "",
      assign_to_goal: false,
    },
  });

  function handleSubmit(values: z.infer<typeof taskSchema>) {
    // Implement task creation/update logic here
    console.log(values);
    onSubmit(values as Task);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Título da Tarefa */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título da Tarefa</FormLabel>
              <FormControl>
                <Input placeholder="Nome da tarefa" {...field} className="glass-card border-white/20" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Descrição */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição (Opcional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Descrição da tarefa..." {...field} className="glass-card border-white/20" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Prioridade e Categoria */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="glass-card border-white/20">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="professional">Profissional</SelectItem>
                    <SelectItem value="intellectual">Intelectual</SelectItem>
                    <SelectItem value="finance">Finanças</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="relationship">Relacionamento</SelectItem>
                    <SelectItem value="family">Família</SelectItem>
                    <SelectItem value="leisure">Lazer</SelectItem>
                    <SelectItem value="health">Saúde</SelectItem>
                    <SelectItem value="spiritual">Espiritual</SelectItem>
                    <SelectItem value="emotional">Emocional</SelectItem>
                    <SelectItem value="other">Outros</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Datas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Início (Opcional)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={`w-full glass-card border-white/20 justify-start text-left font-normal ${!field.value && "text-muted-foreground"}`}
                      >
                        {field.value ? format(field.value, "PPP", { locale: ptBR }) : "Selecionar data"}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
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
                <FormLabel>Data de Vencimento (Opcional)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={`w-full glass-card border-white/20 justify-start text-left font-normal ${!field.value && "text-muted-foreground"}`}
                      >
                        {field.value ? format(field.value, "PPP", { locale: ptBR }) : "Selecionar data"}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
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
              <FormLabel>Horário (Opcional)</FormLabel>
              <FormControl>
                <Input type="time" {...field} className="glass-card border-white/20" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Projeto e Meta */}
        {(projects?.length > 0 || goals?.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects?.length > 0 && (
              <FormField
                control={form.control}
                name="assign_to_project"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          if (!checked) {
                            form.setValue("project_id", "");
                          }
                        }}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Vincular a Projeto</FormLabel>
                      {field.value && (
                        <FormField
                          control={form.control}
                          name="project_id"
                          render={({ field: projectField }) => (
                            <FormItem>
                              <Select onValueChange={projectField.onChange} defaultValue={projectField.value}>
                                <FormControl>
                                  <SelectTrigger className="glass-card border-white/20">
                                    <SelectValue placeholder="Selecionar projeto..." />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {projects.map(project => (
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
                    </div>
                  </FormItem>
                )}
              />
            )}

            {goals?.length > 0 && (
              <FormField
                control={form.control}
                name="assign_to_goal"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          if (!checked) {
                            form.setValue("goal_id", "");
                          }
                        }}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Vincular a Meta</FormLabel>
                      {field.value && (
                        <FormField
                          control={form.control}
                          name="goal_id"
                          render={({ field: goalField }) => (
                            <FormItem>
                              <Select onValueChange={goalField.onChange} defaultValue={goalField.value}>
                                <FormControl>
                                  <SelectTrigger className="glass-card border-white/20">
                                    <SelectValue placeholder="Selecionar meta..." />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {goals.map(goal => (
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
                    </div>
                  </FormItem>
                )}
              />
            )}
          </div>
        )}

        {/* Notificações */}
        <FormField
          control={form.control}
          name="notify_enabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 glass-card border-white/20">
              <div className="space-y-0.5">
                <FormLabel className="flex items-center gap-2 text-base">
                  <Bell className="w-4 h-4" />
                  Notificações
                </FormLabel>
                <div className="text-sm text-muted-foreground">
                  Receber notificações desta tarefa
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

        {/* Repetir */}
        <FormField
          control={form.control}
          name="repeat_enabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 glass-card border-white/20">
              <div className="space-y-0.5">
                <FormLabel className="flex items-center gap-2 text-base">
                  <Repeat className="w-4 h-4" />
                  Repetir tarefa
                </FormLabel>
                <div className="text-sm text-muted-foreground">
                  Repetir automaticamente esta tarefa
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

        {/* Botões */}
        <div className="flex gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" className="glow-button flex-1">
            {initialData ? 'Atualizar' : 'Criar'} Tarefa
          </Button>
        </div>
      </form>
    </Form>
  );
}


