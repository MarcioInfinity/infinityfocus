
export type Priority = 'low' | 'medium' | 'high';

export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';

export type CategoryType = 'professional' | 'intellectual' | 'finance' | 'social' | 'relationship' | 'family' | 'leisure' | 'health' | 'spiritual' | 'emotional' | 'other';

export type FrequencyType = 'daily' | 'weekly' | 'monthly' | 'weekdays' | 'custom';

export type NotificationType = 'time' | 'day' | 'date';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  category: CategoryType;
  status: TaskStatus;
  due_date?: string;
  start_date?: string;
  start_time?: string;
  end_time?: string;
  is_indefinite?: boolean;
  assigned_to?: string;
  project_id?: string;
  goal_id?: string;
  tags: string[];
  checklist: ChecklistItem[];
  notifications: Notification[];
  notifications_enabled: boolean;
  repeat_enabled: boolean;
  repeat_type?: 'daily' | 'weekly' | 'monthly' | 'weekdays' | 'custom';
  repeat_days?: string[];
  repeat_interval?: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ChecklistItem {
  id: string;
  parent_id: string;
  parent_type: 'task' | 'project' | 'goal';
  title: string;
  completed: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Observation {
  id: string;
  parent_id: string;
  parent_type: 'task' | 'project' | 'goal';
  content: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  parent_id: string;
  parent_type: 'task' | 'project' | 'goal';
  action: string;
  description: string;
  created_by: string;
  created_at: string;
}

export interface Notification {
  id: string;
  type: 'reminder' | 'deadline' | 'overdue' | 'completion';
  message: string;
  scheduled_for: string;
  sent: boolean;
  created_at: string;
  // Additional properties for custom notifications
  task_id?: string;
  time?: string;
  days_of_week?: number[];
  specific_date?: string;
  is_active?: boolean;
}

export interface CustomNotification {
  id: string;
  task_id: string;
  type: NotificationType;
  time?: string;
  days_of_week?: number[];
  specific_date?: string;
  message: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  priority: Priority;
  category: CategoryType;
  color: string;
  is_shared: boolean;
  start_date?: string;
  due_date?: string;
  is_indefinite?: boolean;
  start_time?: string;
  end_time?: string;
  notifications_enabled: boolean;
  repeat_enabled: boolean;
  repeat_type?: 'daily' | 'weekly' | 'monthly' | 'weekdays' | 'custom';
  repeat_days?: string[];
  owner_id: string;
  members: ProjectMember[];
  tasks: Task[];
  checklist: ChecklistItem[];
  invite_link?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectMember {
  id: string;
  user_id: string;
  project_id: string;
  role: ProjectRole;
  joined_at: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export type ProjectRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  status: TaskStatus;
  position: number;
  tasks: Task[];
  notifications_enabled?: boolean;
  notification_days?: number;
}

export interface Goal {
  id: string;
  name: string;
  description?: string;
  priority: Priority;
  category: CategoryType;
  progress: number;
  start_date?: string;
  due_date?: string;
  is_shared: boolean;
  notifications_enabled: boolean;
  reward_enabled: boolean;
  reward_description?: string;
  assigned_projects: string[];
  assigned_tasks: string[];
  notes?: string;
  checklist: ChecklistItem[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationSettings {
  id: string;
  user_id: string; 
  tasks_enabled: boolean;
  projects_enabled: boolean;
  goals_enabled: boolean;
  app_notifications: boolean;
  email_notifications: boolean;
  quiet_hours_enabled: boolean;
  quiet_start_time?: string;
  quiet_end_time?: string;
  quiet_days: string[];
  updated_at: string;
}
