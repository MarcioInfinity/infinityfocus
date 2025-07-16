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
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, Plus, X, Link, Mail, Clock } from 'lucide-react';
import { Priority } from '@/types';
import { toISOStringWithoutTimeZone, formatTime, convertCategoryToEnglish } from '@/lib/utils';

interface ProjectFormProps {
  onSubmit: (projectData: any) => void;
  onCancel: () => void;
  initialData?: any;
}

export function ProjectForm({ onSubmit, onCancel, initialData }: ProjectFormProps) {
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
    { id: 'monday', label: 'Segunda' },
    { id: 'tuesday', label: 'Terça' },
    { id: 'wednesday', label: 'Quarta' },
    { id: 'thursday', label: 'Quinta' },
    { id: 'friday', label: 'Sexta' },
    { id: 'saturday', label: 'Sábado' },
    { id: 'sunday', label: 'Domingo' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const projectData = {
      ...formData,
      category: convertCategoryToEnglish(showCustomCategory ? customCategory : formData.category),
      start_date: toISOStringWithoutTimeZone(formData.start_date ? new Date(formData.start_date) : null),
      due_date: toISOStringWithoutTimeZone(formData.due_date ? new Date(formData.due_date) : null),
      start_time: formatTime(formData.start_time),
      end_time: formatTime(formData.end_time),
      invite_emails: formData.is_shared ? inviteEmails.filter(email => email.trim()) : []
    };
    onSubmit(projectData);
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
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {initialData ? 'Editar Projeto' : 'Novo Projeto'}
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nome do Projeto */}
        <div className="space-y-2">
          <Label htmlFor="name">Nome do Projeto *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="neon-border"
            required
          />
        </div>

        {/* Prioridade */}
        <div className="space-y-2">
          <Label>Prioridade</Label>
          <Select value={formData.priority} onValueChange={(value: Priority) => setFormData({...formData, priority: value})}>
            <SelectTrigger className="neon-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass-card">
              <SelectItem value="low">🟢 Baixa</SelectItem>
              <SelectItem value="medium">🟡 Média</SelectItem>
              <SelectItem value="high">🔴 Alta</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Categoria */}
        <div className="space-y-2">
          <Label>Categoria</Label>
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
            <SelectTrigger className="neon-border">
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent className="glass-card">
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
              <SelectItem value="custom">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Personalizada
              </SelectItem>
            </SelectContent>
          </Select>
          {showCustomCategory && (
            <div className="flex gap-2">
              <Input
                placeholder="Digite a categoria personalizada"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="neon-border"
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
        </div>

        {/* Compartilhado */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Compartilhado</Label>
            <Switch
              checked={formData.is_shared}
              onCheckedChange={(checked) => setFormData({...formData, is_shared: checked})}
            />
          </div>

          {formData.is_shared && (
            <div className="glass-card p-4 space-y-4">
              <h4 className="font-medium">Configurações de Compartilhamento</h4>
              
              {/* Método de Convite */}
              <div className="space-y-3">
                <Label>Método de Convite</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="invite_method"
                      value="link"
                      checked={formData.invite_method === 'link'}
                      onChange={(e) => setFormData({...formData, invite_method: e.target.value})}
                    />
                    <Link className="w-4 h-4" />
                    Link de Convite
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="invite_method"
                      value="email"
                      checked={formData.invite_method === 'email'}
                      onChange={(e) => setFormData({...formData, invite_method: e.target.value})}
                    />
                    <Mail className="w-4 h-4" />
                    Convite por Email
                  </label>
                </div>
              </div>

              {formData.invite_method === 'email' && (
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
        </div>

        {/* Datas */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Prazo Indeterminado</Label>
            <Switch
              checked={formData.is_indefinite}
              onCheckedChange={(checked) => setFormData({...formData, is_indefinite: checked})}
            />
          </div>

          {!formData.is_indefinite && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data de Início</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start neon-border">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.start_date ? new Date(formData.start_date).toLocaleDateString('pt-BR') : 'Selecionar data'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="glass-card">
                    <Calendar
                      mode="single"
                      selected={formData.start_date ? new Date(formData.start_date) : undefined}
                      onSelect={(date) => setFormData({...formData, start_date: date?.toISOString() || ''})}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Data de Término</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start neon-border">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.due_date ? new Date(formData.due_date).toLocaleDateString('pt-BR') : 'Selecionar data'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="glass-card">
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
        </div>

        {/* Horários */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Horário de Início</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                className="neon-border pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Horário de Término</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                className="neon-border pl-10"
              />
            </div>
          </div>
        </div>

        {/* Notificar */}
        <div className="flex items-center justify-between">
          <Label>Notificar</Label>
          <Switch
            checked={formData.notifications_enabled}
            onCheckedChange={(checked) => setFormData({...formData, notifications_enabled: checked})}
          />
        </div>

        {/* Frequência */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Repetir</Label>
            <Switch
              checked={formData.repeat_enabled}
              onCheckedChange={(checked) => setFormData({...formData, repeat_enabled: checked})}
            />
          </div>

          {formData.repeat_enabled && (
            <div className="glass-card p-4 space-y-4">
              <div className="space-y-2">
                <Label>Tipo de Repetição</Label>
                <Select value={formData.repeat_type} onValueChange={(value) => setFormData({...formData, repeat_type: value})}>
                  <SelectTrigger className="neon-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-card">
                    <SelectItem value="daily">Diário</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                    <SelectItem value="weekdays">Dias da Semana</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.repeat_type === 'weekdays' && (
                <div className="space-y-2">
                  <Label>Dias da Semana</Label>
                  <div className="flex flex-wrap gap-2">
                    {weekDays.map((day) => (
                      <label key={day.id} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={formData.repeat_days.includes(day.id)}
                          onCheckedChange={() => handleDayToggle(day.id)}
                        />
                        <span className="text-sm">{day.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Descrição */}
        <div className="space-y-2">
          <Label>Descrição</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="neon-border min-h-[100px]"
            placeholder="Descreva o projeto..."
          />
        </div>

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
    </div>
  );
}


