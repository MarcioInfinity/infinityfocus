
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CategoryType, Priority, FrequencyType } from '@/types';

const taskSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  category: z.enum([
    'professional', 'intellectual', 'finance', 'social', 
    'relationship', 'family', 'leisure', 'health', 'spiritual', 'emotional', 'other'
  ]),
  due_date: z.date().optional(),
  start_date: z.date().optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  is_indefinite: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  notifications_enabled: z.boolean().default(false),
  repeat_enabled: z.boolean().default(false),
  repeat_type: z.enum(['daily', 'weekly', 'monthly', 'custom']).optional(),
  repeat_days: z.array(z.string()).optional(),
  monthly_day: z.number().min(1).max(31).optional(),
  project_id: z.string().optional(),
  goal_id: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  onSubmit: (data: TaskFormData) => void;
  onCancel: () => void;
  defaultProjectId?: string;
  defaultGoalId?: string;
  initialData?: Partial<TaskFormData>;
}

export function TaskForm({ onSubmit, onCancel, defaultProjectId, defaultGoalId, initialData }: TaskFormProps) {
  const [newTag, setNewTag] = useState('');
  const [customDays, setCustomDays] = useState<number[]>([]);

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      priority: initialData?.priority || 'medium',
      category: initialData?.category || 'professional',
      due_date: initialData?.due_date,
      start_date: initialData?.start_date,
      start_time: initialData?.start_time || '',
      end_time: initialData?.end_time || '',
      is_indefinite: initialData?.is_indefinite || false,
      tags: initialData?.tags || [],
      notifications_enabled: initialData?.notifications_enabled || false,
      repeat_enabled: initialData?.repeat_enabled || false,
      repeat_type: initialData?.repeat_type,
      repeat_days: initialData?.repeat_days || [],
      monthly_day: initialData?.monthly_day,
      project_id: defaultProjectId || initialData?.project_id,
      goal_id: defaultGoalId || initialData?.goal_id,
    },
  });

  const repeatEnabled = form.watch('repeat_enabled');
  const repeatType = form.watch('repeat_type');
  const tags = form.watch('tags');

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      form.setValue('tags', [...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    form.setValue('tags', tags.filter(tag => tag !== tagToRemove));
  };

  const toggleCustomDay = (day: number) => {
    const newCustomDays = customDays.includes(day) 
      ? customDays.filter(d => d !== day)
      : [...customDays, day].sort((a, b) => a - b);
    setCustomDays(newCustomDays);
    form.setValue('repeat_days', newCustomDays.map(String));
  };

  const handleSubmit = (data: TaskFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {initialData ? 'Editar Tarefa' : 'Nova Tarefa'}
          </h2>
        </div>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título *</FormLabel>
              <FormControl>
                <Input placeholder="Digite o título da tarefa" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descreva a tarefa (opcional)" 
                  className="min-h-[80px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
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

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="professional">💼 Profissional</SelectItem>
                    <SelectItem value="intellectual">🧠 Intelectual</SelectItem>
                    <SelectItem value="finance">💰 Financeiro</SelectItem>
                    <SelectItem value="social">👥 Social</SelectItem>
                    <SelectItem value="relationship">❤️ Relacionamento</SelectItem>
                    <SelectItem value="family">👨‍👩‍👧‍👦 Família</SelectItem>
                    <SelectItem value="leisure">🎮 Lazer</SelectItem>
                    <SelectItem value="health">🏥 Saúde</SelectItem>
                    <SelectItem value="spiritual">🙏 Espiritual</SelectItem>
                    <SelectItem value="emotional">😊 Emocional</SelectItem>
                    <SelectItem value="other">📝 Outro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
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
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>Selecione a data</span>
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
                      disabled={(date) => date < new Date()}
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
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>Selecione a data</span>
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
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora de Início</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora de Término</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="is_indefinite"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Tarefa Indefinida</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Tarefa sem data de vencimento específica
                </div>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <div>
          <FormLabel>Tags</FormLabel>
          <div className="flex gap-2 mt-2">
            <Input
              placeholder="Adicionar tag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <Button type="button" variant="outline" size="sm" onClick={addTag}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <div key={tag} className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-md text-sm">
                  {tag}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 w-4 h-4"
                    onClick={() => removeTag(tag)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <FormField
          control={form.control}
          name="notifications_enabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Notificações</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Receber lembretes sobre esta tarefa
                </div>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="repeat_enabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Repetir Tarefa</FormLabel>
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

        {repeatEnabled && (
          <FormField
            control={form.control}
            name="repeat_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Repetição</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de repetição" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="daily">Diariamente</SelectItem>
                    <SelectItem value="weekly">Semanalmente</SelectItem>
                    <SelectItem value="monthly">Mensalmente</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {repeatEnabled && repeatType === 'weekly' && (
          <FormField
            control={form.control}
            name="repeat_days"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dias da Semana</FormLabel>
                <div className="grid grid-cols-7 gap-2">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, index) => (
                    <div key={day} className="flex items-center space-x-2">
                      <Checkbox
                        id={`day-${index}`}
                        checked={field.value?.includes(String(index)) || false}
                        onCheckedChange={(checked) => {
                          const currentDays = field.value || [];
                          if (checked) {
                            field.onChange([...currentDays, String(index)]);
                          } else {
                            field.onChange(currentDays.filter(d => d !== String(index)));
                          }
                        }}
                      />
                      <label htmlFor={`day-${index}`} className="text-sm font-medium">
                        {day}
                      </label>
                    </div>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {repeatEnabled && repeatType === 'monthly' && (
          <FormField
            control={form.control}
            name="monthly_day"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dia do Mês</FormLabel>
                <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o dia do mês" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <SelectItem key={day} value={day.toString()}>
                        Dia {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {repeatEnabled && repeatType === 'custom' && (
          <FormItem>
            <FormLabel>Dias Personalizados do Mês</FormLabel>
            <div className="grid grid-cols-7 gap-2 max-h-40 overflow-y-auto border rounded p-2">
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <div key={day} className="flex items-center space-x-1">
                  <Checkbox
                    id={`custom-day-${day}`}
                    checked={customDays.includes(day)}
                    onCheckedChange={() => toggleCustomDay(day)}
                  />
                  <label htmlFor={`custom-day-${day}`} className="text-sm">
                    {day}
                  </label>
                </div>
              ))}
            </div>
            {customDays.length > 0 && (
              <div className="text-sm text-muted-foreground mt-2">
                Selecionados: {customDays.join(', ')}
              </div>
            )}
          </FormItem>
        )}

        <div className="flex gap-2 pt-4">
          <Button type="submit" className="flex-1">
            {initialData ? 'Atualizar' : 'Criar'} Tarefa
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  );
}
