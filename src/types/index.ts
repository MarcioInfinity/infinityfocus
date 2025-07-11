
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';
export type NotificationType = 'time' | 'day' | 'date';
export type ProjectRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  due_date?: string;
  project_id?: string;
  assigned_to?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  notifications: Notification[];
  tags: string[];
  position?: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
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

export interface Notification {
  id: string;
  task_id: string;
  type: NotificationType;
  time?: string; // HH:MM format
  days_of_week?: number[]; // 0-6, Sunday = 0
  specific_date?: string; // ISO date string
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
}
