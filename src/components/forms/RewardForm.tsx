import { useState } from 'react';
import { Star, Gift, DollarSign, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface RewardFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function RewardForm({ onSubmit, onCancel }: RewardFormProps) {
  const [celebrationLevel, setCelebrationLevel] = useState(1);
  const [investmentValue, setInvestmentValue] = useState('');
  const [attributedTo, setAttributedTo] = useState('');
  const [attributedType, setAttributedType] = useState('goal');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const rewardData = {
      celebration_level: celebrationLevel,
      investment_value: investmentValue,
      attributed_to: attributedTo,
      attributed_type: attributedType,
      description: description
    };

    onSubmit(rewardData);
  };

  const renderStars = (level: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-6 h-6 cursor-pointer transition-colors ${
          i < level ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
        onClick={() => setCelebrationLevel(i + 1)}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Gift className="w-5 h-5" />
          Nova Recompensa
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Nível de Comemoração</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {renderStars(celebrationLevel)}
              <span className="text-sm text-muted-foreground ml-2">
                {celebrationLevel} estrela{celebrationLevel !== 1 ? 's' : ''}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <Label htmlFor="investment" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Valor de Investimento
          </Label>
          <Input
            id="investment"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={investmentValue}
            onChange={(e) => setInvestmentValue(e.target.value)}
            className="glass-card border-white/20"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Atribuir Condicionado a
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <Select value={attributedType} onValueChange={setAttributedType}>
              <SelectTrigger className="glass-card border-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-card border-white/20">
                <SelectItem value="goal">Meta</SelectItem>
                <SelectItem value="project">Projeto</SelectItem>
                <SelectItem value="task">Tarefa</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder={`ID da ${attributedType === 'goal' ? 'Meta' : attributedType === 'project' ? 'Projeto' : 'Tarefa'}`}
              value={attributedTo}
              onChange={(e) => setAttributedTo(e.target.value)}
              className="glass-card border-white/20"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição da Recompensa</Label>
          <Textarea
            id="description"
            placeholder="Descreva sua recompensa..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="glass-card border-white/20"
            rows={3}
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="submit" className="flex-1 glow-button">
            <Gift className="w-4 h-4 mr-2" />
            Criar Recompensa
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} className="neon-border">
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
