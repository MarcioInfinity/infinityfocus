import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
  CalendarIcon,
  Plus,
  X,
  Link,
  Mail,
  Clock,
  Repeat,
} from 'lucide-react';
import { Priority } from '@/types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { sanitizeProjectData } from '@/utils/formSanitizers';

const projectSchema = z.object({
  name: z.string().min(1, 'Nome do projeto é obrigatório'),
  priority: z.enum(['low', 'medium', 'high']),
  category: z.string(),
  custom_category: z.string().optional(),
  is_shared: z.boolean(),
  start_date: z.date().optional(),
  due_date: z.date().optional(),
  is_indefinite: z.boolean(),
  start_time: z.string()
    .optional()
    .refine((val) => {
      if (!val || val === '') return true;
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      return timeRegex.test(val);
    }, {
      message: 'Formato de horário inválido. Use HH:mm (ex: 14:30)'
    }),
  end_time: z.string()
    .optional()
    .refine((val) => {
      if (!val || val === '') return true;
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      return timeRegex.test(val);
    }, {
      message: 'Formato de horário inválido. Use HH:mm (ex: 14:30)'
    }),
  notifications_enabled: z.boolean(),
  repeat_enabled: z.boolean(),
  repeat_type: z.enum(['daily', 'weekly', 'monthly', 'custom']).optional(),
  repeat_days: z.array(z.number()).optional(),
  monthly_day: z.number().min(1).max(31).optional(),
  custom_dates: z.array(z.date()).optional(),
  description: z.string().optional(),
  invite_method: z.enum(['link', 'email']),
  invite_emails: z.array(z.string().email('Email inválido')).optional(),
});

import { Project } from '@/types';

interface ProjectFormProps {
  onSubmit: (projectData: Project) => void;
  onCancel: () => void;
  initialData?: Project;
}

export function ProjectForm({ onSubmit, onCancel, initialData }: ProjectFormProps) {
  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [inviteEmails, setInviteEmails] = useState(initialData?.invite_emails || ['']);

  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: initialData?.name || '',
      priority: initialData?.priority || 'medium',
      category: initialData?.category || 'professional',
      custom_category: initialData?.custom_category || '',
      is_shared: initialData?.is_shared || false,
      start_date: initialData?.start_date ? new Date(initialData.start_date) : undefined,
      due_date: initialData?.due_date ? new Date(initialData.due_date) : undefined,
      is_indefinite: initialData?.is_indefinite || false,
      start_time: initialData?.start_time || '',
      end_time: initialData?.end_time || '',
      notifications_enabled: initialData?.notifications_enabled || false,
      repeat_enabled: initialData?.repeat_enabled || false,
      repeat_type: (initialData?.repeat_type === 'weekdays' ? 'weekly' : initialData?.repeat_type) || 'daily',
      repeat_days: initialData?.repeat_days?.map(day => parseInt(day)) || [],
      description: initialData?.description || '',
      invite_method: initialData?.invite_method || 'link',
      invite_emails: initialData?.invite_emails || [''],
    },
  });

  const watchIsIndefinite = form.watch('is_indefinite');
  const watchIsShared = form.watch('is_shared');
  const watchInviteMethod = form.watch('invite_method');
  const watchRepeatEnabled = form.watch('repeat_enabled');
  const watchRepeatType = form.watch('repeat_type');
  const watchCategory = form.watch('category');

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

  const handleSubmit = (values: z.infer<typeof projectSchema>) => {
    const projectData = {
      id: initialData?.id || '',
      color: initialData?.color || '#3B82F6',
      user_id: initialData?.user_id || '',
      owner_id: initialData?.owner_id || '',
      members: initialData?.members || [],
      tasks: initialData?.tasks || [],
      checklist: initialData?.checklist || [],
      created_at: initialData?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...values,
      start_date: values.start_date?.toISOString().split('T')[0] || null,
      due_date: values.due_date?.toISOString().split('T')[0] || null,
      custom_category: watchCategory === 'custom' ? customCategory : undefined,
      invite_emails: watchIsShared && watchInviteMethod === 'email' ? inviteEmails.filter(email => email.trim()) : [],
      repeat_days: values.repeat_days?.map(day => day.toString()) || [],
    };
    
    // Sanitizar dados antes de enviar
    const sanitizedData = sanitizeProjectData(projectData);
    onSubmit(sanitizedData as Project);
  };

  const addEmailField = () => {
    setInviteEmails([...inviteEmails, '']);
  };

  const removeEmailField = (index: number) => {
    setInviteEmails(inviteEmails.filter((_, i) => i !== index));
  };

  const updateEmail = (index: number, value: string) => {
    const newEmails = [...inviteEmails];
    newEmails[index] = value;
    setInviteEmails(newEmails);
  };

  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {initialData ? 'Editar Projeto' : 'Novo Projeto'}
        </DialogTitle>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Nome do Projeto */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Projeto *</FormLabel>
                <FormControl>
                  <Input placeholder="Digite o nome do projeto" {...field} />
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

          {/* Compartilhado */}
          <FormField
            control={form.control}
            name="is_shared"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Compartilhado</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Permitir que outros usuários participem deste projeto
                  </div>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          {watchIsShared && (
            <div className="glass-card p-4 space-y-4">
              <h4 className="font-medium">Configurações de Compartilhamento</h4>

              {/* Método de Convite */}
              <FormField
                control={form.control}
                name="invite_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método de Convite</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o método de convite" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="link">Link de Convite</SelectItem>
                          <SelectItem value="email">Convite por Email</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchInviteMethod === 'email' && (
                <div className="space-y-3">
                  <Label>Emails para Convite</Label>
                  {inviteEmails.map((email, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        type="email"
                        placeholder="email@exemplo.com"
                        value={email}
                        onChange={(e) => updateEmail(index, e.target.value)}
                        className="neon-border"
                      />
                      {inviteEmails.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeEmailField(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addEmailField}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Email
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Datas */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="is_indefinite"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Prazo Indeterminado</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Projeto sem data de término específica
                    </div>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            {!watchIsIndefinite && (
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
                              className={`w-full pl-3 text-left font-normal ${!field.value && 'text-muted-foreground'}`}
                            >
                              {field.value ? (
                                format(field.value, 'PPP', { locale: ptBR })
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
                            disabled={(date) => date < new Date('1900-01-01')}
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
                      <FormLabel>Data de Término</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={`w-full pl-3 text-left font-normal ${!field.value && 'text-muted-foreground'}`}
                            >
                              {field.value ? (
                                format(field.value, 'PPP', { locale: ptBR })
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
                            disabled={(date) => date < new Date('1900-01-01')}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>

          {/* Horários */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="start_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Horário de Início
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

            <FormField
              control={form.control}
              name="end_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Horário de Término
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
          </div>

          {/* Notificar */}
          <FormField
            control={form.control}
            name="notifications_enabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Notificar</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Receber notificações sobre este projeto
                  </div>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Frequência */}
          <FormField
            control={form.control}
            name="repeat_enabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Repetir Projeto</FormLabel>
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
              {(watchRepeatType === 'weekly' || watchRepeatType === 'custom') && (
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
              {watchRepeatType === 'monthly' && (
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
              {watchRepeatType === 'custom' && (
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
                              className={`w-full pl-3 text-left font-normal ${!field.value || field.value.length === 0 && 'text-muted-foreground'}`}
                            >
                              {field.value && field.value.length > 0 ? (
                                field.value.map((date: Date) => format(date, 'PPP', { locale: ptBR })).join(', ')
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

          {/* Descrição */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descreva o projeto..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Separator />

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1 neon-border">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 glow-button">
              {initialData ? 'Salvar Alterações' : 'Criar Projeto'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}


