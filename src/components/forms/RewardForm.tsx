
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Goal } from '@/types';

const rewardSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  celebration_level: z.enum(['small', 'medium', 'large']),
  investment_value: z.number().min(0).optional(),
  currency: z.string().default('BRL'),
  attributed_to_type: z.enum(['goal', 'task', 'project']),
  attributed_to_id: z.string().min(1, 'Selecione uma meta/tarefa/projeto'),
  attributed_item_name: z.string().optional(),
});

type RewardFormData = z.infer<typeof rewardSchema>;

interface RewardFormProps {
  onSubmit: (data: RewardFormData) => void;
  onCancel: () => void;
  goals?: Goal[];
  isSubmitting?: boolean;
  initialData?: Partial<RewardFormData>;
}

export function RewardForm({ onSubmit, onCancel, goals = [], isSubmitting = false, initialData }: RewardFormProps) {
  const form = useForm<RewardFormData>({
    resolver: zodResolver(rewardSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      celebration_level: initialData?.celebration_level || 'medium',
      investment_value: initialData?.investment_value || 0,
      currency: initialData?.currency || 'BRL',
      attributed_to_type: initialData?.attributed_to_type || 'goal',
      attributed_to_id: initialData?.attributed_to_id || '',
      attributed_item_name: initialData?.attributed_item_name || '',
    },
  });

  const attributedToType = form.watch('attributed_to_type');
  const attributedToId = form.watch('attributed_to_id');

  // Update attributed_item_name when selection changes
  React.useEffect(() => {
    if (attributedToId && attributedToType === 'goal') {
      const selectedGoal = goals.find(goal => goal.id === attributedToId);
      if (selectedGoal) {
        form.setValue('attributed_item_name', selectedGoal.name);
      }
    }
  }, [attributedToId, attributedToType, goals, form]);

  const handleSubmit = (data: RewardFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {initialData ? 'Editar Recompensa' : 'Nova Recompensa'}
          </h2>
        </div>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título *</FormLabel>
              <FormControl>
                <Input placeholder="Digite o título da recompensa" {...field} />
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
                  placeholder="Descreva a recompensa (opcional)" 
                  className="min-h-[80px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="celebration_level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nível de Celebração *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o nível" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="small">🎉 Pequena</SelectItem>
                  <SelectItem value="medium">🎊 Média</SelectItem>
                  <SelectItem value="large">🏆 Grande</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
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

          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Moeda</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a moeda" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="BRL">Real (BRL)</SelectItem>
                    <SelectItem value="USD">Dólar (USD)</SelectItem>
                    <SelectItem value="EUR">Euro (EUR)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="attributed_to_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Vinculação *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="goal">🎯 Meta</SelectItem>
                  <SelectItem value="task">✅ Tarefa</SelectItem>
                  <SelectItem value="project">📁 Projeto</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {attributedToType === 'goal' && (
          <FormField
            control={form.control}
            name="attributed_to_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Selecionar Meta *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma meta" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
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

        {attributedToType !== 'goal' && (
          <FormField
            control={form.control}
            name="attributed_to_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ID do {attributedToType === 'task' ? 'Tarefa' : 'Projeto'} *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder={`Digite o ID ${attributedToType === 'task' ? 'da tarefa' : 'do projeto'}`}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex gap-2 pt-4">
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? 'Criando...' : (initialData ? 'Atualizar' : 'Criar')} Recompensa
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  );
}
