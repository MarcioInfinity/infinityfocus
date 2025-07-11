
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
  Plus, 
  Calendar as CalendarIcon, 
  Clock,
  Bell,
  Repeat,
  Share2,
  Users,
  Link,
  Mail
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const projectSchema = z.object({
  name: z.string().min(1, 'Nome do projeto é obrigatório'),
  priority: z.enum(['low', 'medium', 'high']),
  category: z.string(),
  custom_category: z.string().optional(),
  is_shared: z.boolean(),
  start_date: z.date().optional(),
  due_date: z.date().optional(),
  is_indefinite: z.boolean(),
  time: z.string().optional(),
  notify_enabled: z.boolean(),
  frequency_enabled: z.boolean(),
  frequency_type: z.enum(['daily', 'weekly', 'monthly', 'weekdays', 'custom']).optional(),
  frequency_days: z.array(z.number()).optional(),
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

interface ProjectFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

export function ProjectForm({ onSubmit, onCancel, initialData }: ProjectFormProps) {
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [shareEmails, setShareEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');

  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      priority: 'medium',
      category: 'professional',
      is_shared: false,
      is_indefinite: false,
      notify_enabled: false,
      frequency_enabled: false,
      ...initialData,
    },
  });

  const watchIsIndefinite = form.watch('is_indefinite');
  const watchNotifyEnabled = form.watch('notify_enabled');
  const watchFrequencyEnabled = form.watch('frequency_enabled');
  const watchIsShared = form.watch('is_shared');
  const watchFrequencyType = form.watch('frequency_type');

  const addEmail = () => {
    if (newEmail.trim() && !shareEmails.includes(newEmail.trim())) {
      setShareEmails([...shareEmails, newEmail.trim()]);
      setNewEmail('');
    }
  };

  const removeEmail = (email: string) => {
    setShareEmails(shareEmails.filter(e => e !== email));
  };

  const generateShareLink = () => {
    // Aqui seria gerado um link único para compartilhamento
    return `https://infinityfocus.app/shared-project/${Date.now()}`;
  };

  const handleSubmit = (values: z.infer<typeof projectSchema>) => {
    const projectData = {
      ...values,
      share_emails: shareEmails,
      share_link: watchIsShared ? generateShareLink() : undefined,
    };
    onSubmit(projectData);
  };

  return (
    <Card className="glass-card max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <Plus className="w-6 h-6" />
          Novo Projeto
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Nome do Projeto */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Projeto</FormLabel>
                  <FormControl>
                    <Input {...field} className="glass-card border-white/20" />
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
                        setShowCustomCategory(value === 'other');
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
                        Permitir que outras pessoas vejam e colaborem neste projeto
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
                    <Label className="flex items-center gap-2">
                      <Link className="w-4 h-4" />
                      Link de Compartilhamento
                    </Label>
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
                        Copiar
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Convidar por Email
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="email@exemplo.com"
                        className="glass-card border-white/20"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEmail())}
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
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <FormField
                  control={form.control}
                  name="is_indefinite"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        Indeterminado
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              {!watchIsIndefinite && (
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
                                className="w-full glass-card border-white/20 justify-start text-left font-normal"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? format(field.value, "PPP", { locale: ptBR }) : "Selecionar data"}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 glass-card border-white/20">
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
                      <FormItem>
                        <FormLabel>Data de Término</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className="w-full glass-card border-white/20 justify-start text-left font-normal"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? format(field.value, "PPP", { locale: ptBR }) : "Selecionar data"}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 glass-card border-white/20">
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
              )}
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
                      Receber notificações para este projeto
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
            {watchNotifyEnabled && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="frequency_enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 glass-card border-white/20">
                      <div className="space-y-0.5">
                        <FormLabel className="flex items-center gap-2 text-base">
                          <Repeat className="w-4 h-4" />
                          Repetir
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Este projeto se repete?
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

                {watchFrequencyEnabled && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="frequency_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Repetição</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="glass-card border-white/20">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="glass-card border-white/20">
                              <SelectItem value="daily">Diário</SelectItem>
                              <SelectItem value="weekly">Semanal</SelectItem>
                              <SelectItem value="monthly">Mensal</SelectItem>
                              <SelectItem value="weekdays">Dias da Semana</SelectItem>
                              <SelectItem value="custom">Personalizado</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {watchFrequencyType === 'weekdays' && (
                      <FormField
                        control={form.control}
                        name="frequency_days"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dias da Semana</FormLabel>
                            <div className="flex flex-wrap gap-2">
                              {weekDays.map((day) => (
                                <Button
                                  key={day.value}
                                  type="button"
                                  variant={field.value?.includes(day.value) ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => {
                                    const currentDays = field.value || [];
                                    const newDays = currentDays.includes(day.value)
                                      ? currentDays.filter(d => d !== day.value)
                                      : [...currentDays, day.value];
                                    field.onChange(newDays);
                                  }}
                                  className={field.value?.includes(day.value) ? "glow-button" : "neon-border"}
                                >
                                  {day.label}
                                </Button>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
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
                    <Textarea {...field} className="glass-card border-white/20" rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                Salvar
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
