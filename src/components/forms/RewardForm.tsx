import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Gift, Target, FolderKanban, CheckSquare } from 'lucide-react';
import { useRewards } from '@/hooks/useRewards';
import { useToastNotifications } from '@/hooks/use-toast-notifications';

// Schema de validação para recompensas - CORRIGIDO
const rewardSchema = z.object({
  title: z.string().min(1, 'Título da recompensa é obrigatório'),
  description: z.string().optional(),
  celebration_level: z.enum(['small', 'medium', 'large', 'epic'], {
    required_error: 'Nível de celebração é obrigatório'
  }),
  investment_value: z.number().min(0, 'Valor deve ser positivo').optional(),
  currency: z.string().default('BRL'),
  attributed_to_type: z.enum(['task', 'project', 'goal'], {
    required_error: 'Tipo de atribuição é obrigatório'
  }),
  attributed_to_id: z.string().min(1, 'Item de atribuição é obrigatório'),
});

interface RewardFormProps {
  onSubmit: (data: z.infer<typeof rewardSchema>) => void;
  onCancel: () => void;
  initialData?: z.infer<typeof rewardSchema>;
}

const celebrationLevels = [
  { value: 'small', label: '🎉 Pequena', description: 'Para pequenas conquistas' },
  { value: 'medium', label: '🎊 Média', description: 'Para conquistas importantes' },
  { value: 'large', label: '🏆 Grande', description: 'Para grandes marcos' },
  { value: 'epic', label: '🎆 Épica', description: 'Para conquistas extraordinárias' },
];

const attributionTypes = [
  { value: 'task', label: 'Tarefa', icon: CheckSquare },
  { value: 'project', label: 'Projeto', icon: FolderKanban },
  { value: 'goal', label: 'Meta', icon: Target },
];

const currencies = [
  { value: 'BRL', label: 'R$ (Real)', symbol: 'R$' },
  { value: 'USD', label: '$ (Dólar)', symbol: '$' },
  { value: 'EUR', label: '€ (Euro)', symbol: '€' },
];

export function RewardForm({ onSubmit, onCancel, initialData }: RewardFormProps) {
  const { availableItems, isLoading: itemsLoading } = useRewards();
  const { showErrorToast } = useToastNotifications();
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof rewardSchema>>({
    resolver: zodResolver(rewardSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      celebration_level: initialData?.celebration_level || 'medium',
      investment_value: initialData?.investment_value || 0,
      currency: initialData?.currency || 'BRL',
      attributed_to_type: initialData?.attributed_to_type || 'task',
      attributed_to_id: initialData?.attributed_to_id || '',
    },
  });

  const watchAttributedType = form.watch('attributed_to_type');
  const watchCurrency = form.watch('currency');
  const watchInvestmentValue = form.watch('investment_value');
  const watchCelebrationLevel = form.watch('celebration_level');

  // Obter itens disponíveis baseado no tipo selecionado
  const getAvailableItemsForType = () => {
    if (!availableItems) return [];
    
    switch (watchAttributedType) {
      case 'task':
        return availableItems.tasks || [];
      case 'project':
        return availableItems.projects || [];
      case 'goal':
        return availableItems.goals || [];
      default:
        return [];
    }
  };

  const currentAvailableItems = getAvailableItemsForType();

  // Limpar seleção se o item atual não estiver disponível no novo tipo
  useEffect(() => {
    const currentSelection = form.getValues('attributed_to_id');
    const items = getAvailableItemsForType();
    if (currentSelection && !items.find(item => item.id === currentSelection)) {
      form.setValue('attributed_to_id', '');
    }
  }, [watchAttributedType, availableItems, form]);

  // CORREÇÃO #5: Implementar corretamente o handleSubmit
  const handleSubmit = async (values: z.infer<typeof rewardSchema>) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Encontrar o nome do item selecionado para incluir nos dados
      const selectedItem = getAvailableItemsForType().find(item => item.id === values.attributed_to_id);
      
      if (!selectedItem) {
        showErrorToast('Item selecionado não encontrado');
        return;
      }

      const rewardData = {
        ...values,
        attributed_item_name: selectedItem.name,
        investment_value: values.investment_value || 0,
        // Garantir que todos os campos necessários estejam presentes
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      console.log('Dados da recompensa a serem enviados:', rewardData);
      
      await onSubmit(rewardData);
    } catch (error) {
      console.error('Erro ao criar recompensa:', error);
      showErrorToast('Erro ao criar recompensa. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCelebrationIcon = (level: string) => {
    switch (level) {
      case 'small': return '🎉';
      case 'medium': return '🎊';
      case 'large': return '🏆';
      case 'epic': return '🎆';
      default: return '🎁';
    }
  };

  const getAttributionIcon = (type: string) => {
    const typeConfig = attributionTypes.find(t => t.value === type);
    return typeConfig ? typeConfig.icon : CheckSquare;
  };

  const getCurrencySymbol = (currency: string) => {
    const currencyConfig = currencies.find(c => c.value === currency);
    return currencyConfig ? currencyConfig.symbol : 'R$';
  };

  return (
    <Card className="glass-card max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <Gift className="w-6 h-6" />
          {initialData ? 'Editar Recompensa' : 'Nova Recompensa'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Título da Recompensa */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título da Recompensa *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Jantar especial, Comprar um livro..." {...field} />
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
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva os detalhes da recompensa..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nível de Celebração */}
            <FormField
              control={form.control}
              name="celebration_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nível de Celebração *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o nível de celebração" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {celebrationLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          <div className="flex flex-col">
                            <span>{level.label}</span>
                            <span className="text-xs text-muted-foreground">{level.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Valor do Investimento */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="investment_value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor do Investimento</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Moeda</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.value} value={currency.value}>
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Tipo de Atribuição */}
            <FormField
              control={form.control}
              name="attributed_to_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Atribuir Recompensa a *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {attributionTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Seleção do Item Específico */}
            <FormField
              control={form.control}
              name="attributed_to_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    {React.createElement(getAttributionIcon(watchAttributedType), { className: "w-4 h-4" })}
                    Selecionar {attributionTypes.find(t => t.value === watchAttributedType)?.label} *
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={`Selecione uma ${attributionTypes.find(t => t.value === watchAttributedType)?.label.toLowerCase()}`} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {getAvailableItemsForType().length === 0 ? (
                        <SelectItem value="" disabled>
                          Nenhuma {attributionTypes.find(t => t.value === watchAttributedType)?.label.toLowerCase()} disponível
                        </SelectItem>
                      ) : (
                        getAvailableItemsForType().map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preview da Recompensa */}
            {form.watch('title') && form.watch('attributed_to_id') && (
              <div className="border rounded-lg p-4 bg-muted/20">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Gift className="w-4 h-4" />
                  Preview da Recompensa
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span>{getCelebrationIcon(watchCelebrationLevel)}</span>
                    <span className="font-medium">{form.watch('title')}</span>
                  </div>
                  {watchInvestmentValue > 0 && (
                    <div className="text-muted-foreground">
                      Valor: {getCurrencySymbol(watchCurrency)} {watchInvestmentValue?.toFixed(2)}
                    </div>
                  )}
                  <div className="text-muted-foreground">
                    Será liberada quando a {attributionTypes.find(t => t.value === watchAttributedType)?.label.toLowerCase()} "{getAvailableItemsForType().find(item => item.id === form.watch('attributed_to_id'))?.name}" for concluída.
                  </div>
                </div>
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-4 pt-4">
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={getAvailableItemsForType().length === 0 || isSubmitting}
              >
                {isSubmitting ? 'Criando...' : (initialData ? 'Atualizar Recompensa' : 'Criar Recompensa')}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

