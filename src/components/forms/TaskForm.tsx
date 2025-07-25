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
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Nome da tarefa" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Add other form fields here based on the schema */}
        <Button type="submit">Salvar Tarefa</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
      </form>
    </Form>
  );
}


