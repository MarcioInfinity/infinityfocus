import { Task, Project, Goal } from '@/types';

/**
 * Remove campos auxiliares do formulário de tarefas que não existem no schema do banco
 */
export const sanitizeTaskData = (data: any): Partial<Task> => {
  const {
    assign_to_project,
    assign_to_goal,
    notify_enabled,
    ...rest
  } = data;

  // Mapear notify_enabled para notifications_enabled
  const sanitized: any = {
    ...rest,
    notifications_enabled: notify_enabled || false,
  };

  // Garantir que project_id e goal_id sejam null quando não selecionados
  if (!assign_to_project || assign_to_project === 'none') {
    sanitized.project_id = null;
  } else {
    sanitized.project_id = assign_to_project;
  }

  if (!assign_to_goal || assign_to_goal === 'none') {
    sanitized.goal_id = null;
  } else {
    sanitized.goal_id = assign_to_goal;
  }

  // Remover campos que não pertencem ao schema do banco
  delete sanitized.assign_to_project;
  delete sanitized.assign_to_goal;
  delete sanitized.notify_enabled;

  return sanitized;
};

/**
 * Remove campos auxiliares do formulário de projetos que não existem no schema do banco
 */
export const sanitizeProjectData = (data: any): Partial<Project> => {
  const {
    notify_enabled,
    ...rest
  } = data;

  const sanitized: any = {
    ...rest,
    notifications_enabled: notify_enabled || false,
  };

  // Converter repeat_days para array de strings se necessário
  if (sanitized.repeat_days && !Array.isArray(sanitized.repeat_days)) {
    sanitized.repeat_days = [sanitized.repeat_days];
  }

  // Remover campos auxiliares
  delete sanitized.notify_enabled;

  return sanitized;
};

/**
 * Remove campos auxiliares do formulário de metas que não existem no schema do banco
 */
export const sanitizeGoalData = (data: any): Partial<Goal> => {
  const {
    notify_enabled,
    ...rest
  } = data;

  const sanitized: any = {
    ...rest,
    notifications_enabled: notify_enabled || false,
  };

  // Garantir que reward_enabled e reward_description sejam salvos
  if (!sanitized.reward_enabled) {
    sanitized.reward_enabled = false;
    sanitized.reward_description = null;
  }

  // Remover campos auxiliares
  delete sanitized.notify_enabled;

  return sanitized;
};
