import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, Plus, X, Link, Mail, Clock } from 'lucide-react';
import { Priority } from '@/types';
import { useProjects } from '@/hooks/useProjects';

interface ProjectFormProps {
  onClose: () => void;
  initialData?: any;
}

export function ProjectForm({ onClose, initialData }: ProjectFormProps) {
  const { createProject } = useProjects();
  
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    priority: initialData?.priority || 'medium' as Priority,
    category: initialData?.category || '',
    is_shared: initialData?.is_shared || false,
    start_date: initialData?.start_date || '',
    due_date: initialData?.due_date || '',
    is_indefinite: initialData?.is_indefinite || false,
    start_time: initialData?.start_time || '',
    end_time: initialData?.end_time || '',
    notifications_enabled: initialData?.notifications_enabled || false,
    repeat_enabled: initialData?.repeat_enabled || false,
    repeat_type: initialData?.repeat_type || 'daily',
    repeat_days: initialData?.repeat_days || [],
    description: initialData?.description || '',
    invite_method: 'link' // 'link' or 'email'
  });

  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [inviteEmails, setInviteEmails] = useState(['']);

  const categories = [
    'Profissional', 'Intelectual', 'Finanças', 'Social', 
    'Relacionamento', 'Família', 'Lazer', 'Saúde', 
    'Espiritual', 'Emocional', 'Outros'
  ];

  const weekDays = [
    { id: 'monday', label: 'Seg' },
    { id: 'tuesday', label: 'Ter' },
    { id: 'wednesday', label: 'Qua' },
    { id: 'thursday', label: 'Qui' },
    { id: 'friday', label: 'Sex' },
    { id: 'saturday', label: 'Sáb' },
    { id: 'sunday', label: 'Dom' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const projectData = {
        ...formData,
        category: showCustomCategory ? customCategory : formData.category,
        invite_emails: formData.is_shared ? inviteEmails.filter(email => email.trim()) : []
      };
      
      await createProject(projectData);
      onClose();
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
    }
  };

  const handleDayToggle = (dayId: string) => {
    setFormData(prev => ({
      ...prev,
      repeat_days: prev.repeat_days.includes(dayId)
        ? prev.repeat_days.filter(d => d !== dayId)
        : [...prev.repeat_days, dayId]
    }));
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
    <div className="max-w-lg mx-auto">
      <div className="mb-4">
        <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {initialData ? 'Editar Projeto' : 'Novo Projeto'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nome do Projeto */}
        <div className="space-y-1">
          <Label htmlFor="name" className="text-sm">Nome do Projeto *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="neon-border h-9"
            required
          />
        </div>

        {/* Prioridade e Categoria */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-sm">Prioridade</Label>
            <Select value={formData.priority} onValueChange={(value: Priority) => setFormData({...formData, priority: value})}>
              <SelectTrigger className="neon-border h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-card">
                <SelectItem value="low">🟢 Baixa</SelectItem>
                <SelectItem value="medium">🟡 Média</SelectItem>
                <SelectItem value="high">🔴 Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-sm">Categoria</Label>
            <Select 
              value={showCustomCategory ? 'custom' : formData.category} 
              onValueChange={(value) => {
                if (value === 'custom') {
                  setShowCustomCategory(true);
                } else {
                  setShowCustomCategory(false);
                  setFormData({...formData, category: value});
                }
              }}
            >
              <SelectTrigger className="neon-border h-9">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent className="glass-card">
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
                <SelectItem value="custom">
                  <Plus className="w-4 h-4 mr-2" />
                  Personalizada
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {showCustomCategory && (
          <div className="flex gap-2">
            <Input
              placeholder="Categoria personalizada"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              className="neon-border h-9"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setShowCustomCategory(false);
                setCustomCategory('');
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Switches */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Compartilhado</Label>
            <Switch
              checked={formData.is_shared}
              onCheckedChange={(checked) => setFormData({...formData, is_shared: checked})}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm">Prazo Indeterminado</Label>
            <Switch
              checked={formData.is_indefinite}
              onCheckedChange={(checked) => setFormData({...formData, is_indefinite: checked})}
            />
          </div>
        </div>

        {/* Datas */}
        {!formData.is_indefinite && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-sm">Data Início</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start neon-border h-9 text-xs">
                    <CalendarIcon className="mr-2 h-3 w-3" />
                    {formData.start_date ? new Date(formData.start_date).toLocaleDateString('pt-BR') : 'Selecionar'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="glass-card w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.start_date ? new Date(formData.start_date) : undefined}
                    onSelect={(date) => setFormData({...formData, start_date: date?.toISOString() || ''})}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1">
              <Label className="text-sm">Data Término</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start neon-border h-9 text-xs">
                    <CalendarIcon className="mr-2 h-3 w-3" />
                    {formData.due_date ? new Date(formData.due_date).toLocaleDateString('pt-BR') : 'Selecionar'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="glass-card w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.due_date ? new Date(formData.due_date) : undefined}
                    onSelect={(date) => setFormData({...formData, due_date: date?.toISOString() || ''})}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}

        {/* Horários */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-sm">Início</Label>
            <div className="relative">
              <Clock className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
              <Input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                className="neon-border pl-8 h-9 text-xs"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-sm">Término</Label>
            <div className="relative">
              <Clock className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
              <Input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                className="neon-border pl-8 h-9 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Notificações e Repetição */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Notificações</Label>
            <Switch
              checked={formData.notifications_enabled}
              onCheckedChange={(checked) => setFormData({...formData, notifications_enabled: checked})}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm">Repetir</Label>
            <Switch
              checked={formData.repeat_enabled}
              onCheckedChange={(checked) => setFormData({...formData, repeat_enabled: checked})}
            />
          </div>
        </div>

        {/* Configurações de Repetição */}
        {formData.repeat_enabled && (
          <div className="glass-card p-3 space-y-3">
            <div className="space-y-1">
              <Label className="text-sm">Tipo</Label>
              <Select value={formData.repeat_type} onValueChange={(value) => setFormData({...formData, repeat_type: value})}>
                <SelectTrigger className="neon-border h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card">
                  <SelectItem value="daily">Diário</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="weekdays">Dias da Semana</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.repeat_type === 'weekdays' && (
              <div className="space-y-2">
                <Label className="text-sm">Dias</Label>
                <div className="flex flex-wrap gap-1">
                  {weekDays.map((day) => (
                    <label key={day.id} className="flex items-center gap-1 cursor-pointer text-xs">
                      <Checkbox
                        checked={formData.repeat_days.includes(day.id)}
                        onCheckedChange={() => handleDayToggle(day.id)}
                      />
                      <span>{day.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Configurações de Compartilhamento */}
        {formData.is_shared && (
          <div className="glass-card p-3 space-y-3">
            <h4 className="font-medium text-sm">Compartilhamento</h4>
            
            <div className="space-y-2">
              <Label className="text-sm">Método</Label>
              <div className="flex gap-3">
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="radio"
                    name="invite_method"
                    value="link"
                    checked={formData.invite_method === 'link'}
                    onChange={(e) => setFormData({...formData, invite_method: e.target.value})}
                  />
                  <Link className="w-3 h-3" />
                  Link
                </label>
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="radio"
                    name="invite_method"
                    value="email"
                    checked={formData.invite_method === 'email'}
                    onChange={(e) => setFormData({...formData, invite_method: e.target.value})}
                  />
                  <Mail className="w-3 h-3" />
                  Email
                </label>
              </div>
            </div>

            {formData.invite_method === 'email' && (
              <div className="space-y-2">
                <Label className="text-sm">Emails</Label>
                {inviteEmails.map((email, index) => (
                  <div key={index} className="flex gap-1">
                    <Input
                      type="email"
                      placeholder="email@exemplo.com"
                      value={email}
                      onChange={(e) => updateEmail(index, e.target.value)}
                      className="neon-border h-8 text-xs"
                    />
                    {inviteEmails.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeEmailField(index)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addEmailField}
                  className="h-7 text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Adicionar
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Descrição */}
        <div className="space-y-1">
          <Label className="text-sm">Descrição</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="neon-border min-h-[60px] text-xs"
            placeholder="Descreva o projeto..."
          />
        </div>

        <Separator />

        {/* Botões */}
        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1 neon-border h-9">
            Cancelar
          </Button>
          <Button type="submit" className="flex-1 glow-button h-9">
            {initialData ? 'Salvar' : 'Criar'}
          </Button>
        </div>
      </form>
    </div>
  );
}

