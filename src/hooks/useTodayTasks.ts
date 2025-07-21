
import { useMemo } from 'react';
import { useTasks } from './useTasks';
import { useUserSettings } from './useUserSettings';

export function useTodayTasks() {
  const { tasks } = useTasks();
  const { settings } = useUserSettings();

  const todayTasks = useMemo(() => {
    const today = new Date();
    const timezone = settings?.timezone || 'America/Sao_Paulo';
    
    // Configurar data para o fuso horário do usuário
    const todayInTimezone = new Date(today.toLocaleString('en-US', { timeZone: timezone }));
    const todayDateString = todayInTimezone.toISOString().split('T')[0];
    const todayDayOfWeek = todayInTimezone.getDay(); // 0 = Sunday, 1 = Monday, etc.

    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayDayName = dayNames[todayDayOfWeek];

    return tasks.filter(task => {
      if (task.status === 'done') return false;

      // 1. Tarefas com vencimento para hoje
      if (task.due_date === todayDateString) {
        return true;
      }

      // 2. Tarefas com repetição diária
      if (task.repeat_enabled && task.repeat_type === 'daily') {
        return true;
      }

      // 3. Tarefas configuradas para dias específicos da semana
      if (task.repeat_enabled && task.repeat_type === 'weekly' && task.repeat_days) {
        return task.repeat_days.includes(todayDayName);
      }

      // 4. Tarefas com repetição mensal (se hoje é o dia do mês da data de início)
      if (task.repeat_enabled && task.repeat_type === 'monthly' && task.start_date) {
        const startDate = new Date(task.start_date);
        const todayDay = todayInTimezone.getDate();
        const startDay = startDate.getDate();
        return todayDay === startDay;
      }

      return false;
    });
  }, [tasks, settings]);

  return {
    todayTasks: todayTasks.sort((a, b) => {
      // Ordenar por prioridade e depois por horário
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      // Se tiver horário, ordenar por horário
      if (a.start_time && b.start_time) {
        return a.start_time.localeCompare(b.start_time);
      }
      
      return 0;
    }),
  };
}
