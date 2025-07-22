
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface RewardFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const celebrationLevels = [
  { value: 'small', label: 'Pequena Conquista', icon: '🎉' },
  { value: 'medium', label: 'Conquista Média', icon: '🏆' },
  { value: 'large', label: 'Grande Conquista', icon: '🎊' },
  { value: 'epic', label: 'Conquista Épica', icon: '👑' },
];

const currencies = [
  { value: 'BRL', label: 'Real (R$)', symbol: 'R$' },
  { value: 'USD', label: 'Dólar ($)', symbol: '$' },
  { value: 'EUR', label: 'Euro (€)', symbol: '€' },
];

const attributionTypes = [
  { value: 'task', label: 'Tarefa' },
  { value: 'project', label: 'Projeto' },
  { value: 'goal', label: 'Meta' },
];

export function RewardForm({ onSubmit, onCancel }: RewardFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    celebration_level: 'medium',
    investment_value: '',
    currency: 'BRL',
    attributed_to_type: 'goal',
    attributed_to_id: '',
    attributed_item_name: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      investment_value: formData.investment_value ? parseFloat(formData.investment_value) : null,
    };
    
    onSubmit(submitData);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          🎁 Nova Recompensa
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Título da Recompensa *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ex: Jantar especial, viagem, novo gadget..."
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva detalhes da sua recompensa..."
              rows={3}
            />
          </div>

          <div>
            <Label>Nível de Celebração</Label>
            <Select value={formData.celebration_level} onValueChange={(value) => setFormData(prev => ({ ...prev, celebration_level: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {celebrationLevels.map(level => (
                  <SelectItem key={level.value} value={level.value}>
                    <div className="flex items-center gap-2">
                      <span>{level.icon}</span>
                      {level.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="investment_value">Valor de Investimento</Label>
              <Input
                id="investment_value"
                type="number"
                step="0.01"
                min="0"
                value={formData.investment_value}
                onChange={(e) => setFormData(prev => ({ ...prev, investment_value: e.target.value }))}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label>Moeda</Label>
              <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map(currency => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Atribuir a</Label>
            <Select value={formData.attributed_to_type} onValueChange={(value) => setFormData(prev => ({ ...prev, attributed_to_type: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {attributionTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="attributed_item_name">Nome do Item Atribuído</Label>
            <Input
              id="attributed_item_name"
              value={formData.attributed_item_name}
              onChange={(e) => setFormData(prev => ({ ...prev, attributed_item_name: e.target.value }))}
              placeholder="Nome da tarefa, projeto ou meta..."
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" className="flex-1">
            Criar Recompensa
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </form>
    </>
  );
}
