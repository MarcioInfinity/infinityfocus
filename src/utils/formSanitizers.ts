import { Task, Project, Goal } from '@/types';

/**
 * Sanitiza dados para CRIAÇÃO de tarefas (INSERT)
 * Inclui todos os campos necessários e atribui valores padrão
 */
export const sanitizeTaskDataForCreate = (data: any, userId: string): Partial<Task> => {
  const { assign_to_project, assign_to_goal, notify_enabled, ...rest } = data;
  
  // Converte strings vazias para null
  const cleaned = Object.fromEntries(
    Object.entries(rest).map(([key, value]) => [
      key,
      value === '' || value === undefined ? null : value
    ])
  );
  
  return {
    ...cleaned,
    user_id: userId,
    created_by: userId,
    notifications_enabled: notify_enabled || false,
    repeat_enabled: Boolean(rest.repeat_enabled),
    project_id: assign_to_project && assign_to_project !== 'none' ? assign_to_project : null,
    goal_id: assign_to_goal && assign_to_goal !== 'none' ? assign_to_goal : null,
  };
};

/**
 * Sanitiza dados para ATUALIZAÇÃO de tarefas (UPDATE)
 * Remove campos imutáveis e campos auxiliares
 */
export const sanitizeTaskDataForUpdate = (data: any): Partial<Task> => {
  const immutableFields = ['id', 'user_id', 'created_by', 'created_at'];
  const { assign_to_project, assign_to_goal, notify_enabled, checklist, notifications, ...rest } = data;
  
  // Remove campos imutáveis
  immutableFields.forEach(field => delete rest[field]);
  
  // Converte strings vazias para null
  const cleaned = Object.fromEntries(
    Object.entries(rest).map(([key, value]) => [
      key,
      value === '' ? null : value
    ])
  );
  
  return {
    ...cleaned,
    notifications_enabled: notify_enabled !== undefined ? notify_enabled : Boolean(cleaned.notifications_enabled),
    repeat_enabled: Boolean(cleaned.repeat_enabled),
    project_id: assign_to_project && assign_to_project !== 'none' ? assign_to_project : null,
    goal_id: assign_to_goal && assign_to_goal !== 'none' ? assign_to_goal : null,
    updated_at: new Date().toISOString(),
  };
};

/**
 * Sanitiza dados de tarefas (compatibilidade retroativa)
 */
export const sanitizeTaskData = (data: any): Partial<Task> => {
  return sanitizeTaskDataForUpdate(data);
};

/**
 * Sanitiza dados para CRIAÇÃO de projetos (INSERT)
 */
export const sanitizeProjectDataForCreate = (data: any, ownerId: string): Partial<Project> => {
  const { notify_enabled, ...rest } = data;
  
  const cleaned = Object.fromEntries(
    Object.entries(rest).map(([key, value]) => [
      key,
      value === '' || value === undefined ? null : value
    ])
  );
  
  return {
    ...cleaned,
    owner_id: ownerId,
    user_id: ownerId,
    notifications_enabled: notify_enabled || false,
    repeat_days: cleaned.repeat_days && Array.isArray(cleaned.repeat_days) 
      ? cleaned.repeat_days 
      : cleaned.repeat_days ? [cleaned.repeat_days] : [],
  };
};

/**
 * Sanitiza dados para ATUALIZAÇÃO de projetos (UPDATE)
 */
export const sanitizeProjectDataForUpdate = (data: any): Partial<Project> => {
  const immutableFields = ['id', 'owner_id', 'user_id', 'created_at'];
  const { notify_enabled, ...rest } = data;
  
  // Remove campos imutáveis
  immutableFields.forEach(field => delete rest[field]);
  
  const cleaned = Object.fromEntries(
    Object.entries(rest).map(([key, value]) => [
      key,
      value === '' ? null : value
    ])
  );
  
  return {
    ...cleaned,
    notifications_enabled: notify_enabled !== undefined ? notify_enabled : Boolean(cleaned.notifications_enabled),
    repeat_days: cleaned.repeat_days && Array.isArray(cleaned.repeat_days) 
      ? cleaned.repeat_days 
      : cleaned.repeat_days ? [cleaned.repeat_days] : [],
    updated_at: new Date().toISOString(),
  };
};

/**
 * Sanitiza dados de projetos (compatibilidade retroativa)
 */
export const sanitizeProjectData = (data: any): Partial<Project> => {
  return sanitizeProjectDataForUpdate(data);
};

/**
 * Sanitiza dados para CRIAÇÃO de metas (INSERT)
 */
export const sanitizeGoalDataForCreate = (data: any, userId: string): Partial<Goal> => {
  const { notify_enabled, ...rest } = data;
  
  const cleaned = Object.fromEntries(
    Object.entries(rest).map(([key, value]) => [
      key,
      value === '' || value === undefined ? null : value
    ])
  );
  
  return {
    ...cleaned,
    user_id: userId,
    created_by: userId,
    notifications_enabled: notify_enabled || false,
    reward_enabled: Boolean(cleaned.reward_enabled),
    reward_description: cleaned.reward_enabled ? (cleaned.reward_description as string | null) : null,
  };
};

/**
 * Sanitiza dados para ATUALIZAÇÃO de metas (UPDATE)
 */
export const sanitizeGoalDataForUpdate = (data: any): Partial<Goal> => {
  const immutableFields = ['id', 'user_id', 'created_by', 'created_at'];
  const { notify_enabled, ...rest } = data;
  
  // Remove campos imutáveis
  immutableFields.forEach(field => delete rest[field]);
  
  const cleaned = Object.fromEntries(
    Object.entries(rest).map(([key, value]) => [
      key,
      value === '' ? null : value
    ])
  );
  
  return {
    ...cleaned,
    notifications_enabled: notify_enabled !== undefined ? notify_enabled : Boolean(cleaned.notifications_enabled),
    reward_enabled: Boolean(cleaned.reward_enabled),
    reward_description: cleaned.reward_enabled ? (cleaned.reward_description as string | null) : null,
    updated_at: new Date().toISOString(),
  };
};

/**
 * Sanitiza dados de metas (compatibilidade retroativa)
 */
export const sanitizeGoalData = (data: any): Partial<Goal> => {
  return sanitizeGoalDataForUpdate(data);
};
