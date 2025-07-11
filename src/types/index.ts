
export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';
export type NotificationType = 'time' | 'day' | 'date';
export type ProjectRole = 'owner' | 'admin' | 'member' | 'viewer';
export type FrequencyType = 'daily' | 'weekly' | 'monthly' | 'weekdays' | 'custom';
export type CategoryType = 'professional' | 'intellectual' | 'finance' | 'social' | 'relationship' | 'family' | 'leisure' | 'health' | 'spiritual' | 'emotional' | 'other';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  created_at: string;
}

export interface CustomCategory {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  task_id: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  category: CategoryType;
  custom_category_id?: string;
  start_date?: string;
  due_date?: string;
  is_indefinite: boolean;
  time?: string;
  notify_enabled: boolean;
  frequency_enabled: boolean;
  frequency_type?: FrequencyType;
  frequency_days?: number[];
  project_id?: string;
  assigned_to?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  notifications: Notification[];
  tags: string[];
  position?: number;
  checklist: ChecklistItem[];
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  priority: Priority;
  category: CategoryType;
  custom_category_id?: string;
  color: string;
  is_shared: boolean;
  share_link?: string;
  start_date?: string;
  due_date?: string;
  is_indefinite: boolean;
  time?: string;
  notify_enabled: boolean;
  frequency_enabled: boolean;
  frequency_type?: FrequencyType;
  frequency_days?: number[];
  owner_id: string;
  created_at: string;
  updated_at: string;
  members: ProjectMember[];
  tasks: Task[];
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: ProjectRole;
  joined_at: string;
  user: User;
}

export interface Goal {
  id: string;
  name: string;
  description?: string;
  priority: Priority;
  category: CategoryType;
  custom_category_id?: string;
  is_shared: boolean;
  share_link?: string;
  start_date: string;
  due_date: string;
  time?: string;
  notify_enabled: boolean;
  reward_enabled: boolean;
  reward_description?: string;
  progress: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  assigned_projects: string[];
  assigned_tasks: string[];
}

export interface Notification {
  id: string;
  task_id?: string;
  project_id?: string;
  goal_id?: string;
  type: NotificationType;
  time?: string;
  days_of_week?: number[];
  specific_date?: string;
  message: string;
  is_active: boolean;
  created_at: string;
}

export interface KanbanColumn {
  id: string;
  title: string;
  status: TaskStatus;
  tasks: Task[];
  color: string;
  position: number;
}

export interface UserSettings {
  id: string;
  user_id: string;
  notify_tasks: boolean;
  notify_projects: boolean;
  notify_goals: boolean;
  notify_app: boolean;
  notify_email: boolean;
  quiet_days: number[];
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  updated_at: string;
}
