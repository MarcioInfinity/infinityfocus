
import { useMemo } from 'react';
import { Task, Project, Goal } from '@/types';

interface SearchFilters {
  searchTerm: string;
  priority?: string;
  category?: string;
  status?: string;
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  tags: string[];
}

export function useTaskSearch(tasks: Task[], filters: SearchFilters) {
  return useMemo(() => {
    let filteredTasks = tasks;

    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filteredTasks = filteredTasks.filter(task =>
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower) ||
        task.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Priority filter
    if (filters.priority) {
      filteredTasks = filteredTasks.filter(task => task.priority === filters.priority);
    }

    // Category filter
    if (filters.category) {
      filteredTasks = filteredTasks.filter(task => task.category === filters.category);
    }

    // Status filter
    if (filters.status) {
      filteredTasks = filteredTasks.filter(task => task.status === filters.status);
    }

    // Date range filter
    if (filters.dateRange?.from || filters.dateRange?.to) {
      filteredTasks = filteredTasks.filter(task => {
        if (!task.due_date) return false;
        
        const taskDate = new Date(task.due_date);
        const fromDate = filters.dateRange?.from;
        const toDate = filters.dateRange?.to;

        if (fromDate && taskDate < fromDate) return false;
        if (toDate && taskDate > toDate) return false;
        
        return true;
      });
    }

    // Tags filter
    if (filters.tags.length > 0) {
      filteredTasks = filteredTasks.filter(task =>
        filters.tags.some(filterTag =>
          task.tags?.includes(filterTag)
        )
      );
    }

    return filteredTasks;
  }, [tasks, filters]);
}

export function useProjectSearch(projects: Project[], filters: SearchFilters) {
  return useMemo(() => {
    let filteredProjects = projects;

    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filteredProjects = filteredProjects.filter(project =>
        project.name.toLowerCase().includes(searchLower) ||
        project.description?.toLowerCase().includes(searchLower)
      );
    }

    // Priority filter
    if (filters.priority) {
      filteredProjects = filteredProjects.filter(project => project.priority === filters.priority);
    }

    // Category filter
    if (filters.category) {
      filteredProjects = filteredProjects.filter(project => project.category === filters.category);
    }

    // Date range filter
    if (filters.dateRange?.from || filters.dateRange?.to) {
      filteredProjects = filteredProjects.filter(project => {
        if (!project.due_date) return false;
        
        const projectDate = new Date(project.due_date);
        const fromDate = filters.dateRange?.from;
        const toDate = filters.dateRange?.to;

        if (fromDate && projectDate < fromDate) return false;
        if (toDate && projectDate > toDate) return false;
        
        return true;
      });
    }

    return filteredProjects;
  }, [projects, filters]);
}

export function useGoalSearch(goals: Goal[], filters: SearchFilters) {
  return useMemo(() => {
    let filteredGoals = goals;

    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filteredGoals = filteredGoals.filter(goal =>
        goal.name.toLowerCase().includes(searchLower) ||
        goal.description?.toLowerCase().includes(searchLower) ||
        goal.notes?.toLowerCase().includes(searchLower)
      );
    }

    // Priority filter
    if (filters.priority) {
      filteredGoals = filteredGoals.filter(goal => goal.priority === filters.priority);
    }

    // Category filter
    if (filters.category) {
      filteredGoals = filteredGoals.filter(goal => goal.category === filters.category);
    }

    // Date range filter
    if (filters.dateRange?.from || filters.dateRange?.to) {
      filteredGoals = filteredGoals.filter(goal => {
        if (!goal.due_date) return false;
        
        const goalDate = new Date(goal.due_date);
        const fromDate = filters.dateRange?.from;
        const toDate = filters.dateRange?.to;

        if (fromDate && goalDate < fromDate) return false;
        if (toDate && goalDate > toDate) return false;
        
        return true;
      });
    }

    return filteredGoals;
  }, [goals, filters]);
}

// Helper function to extract all unique tags from tasks
export function useAvailableTags(tasks: Task[]) {
  return useMemo(() => {
    const tagSet = new Set<string>();
    tasks.forEach(task => {
      task.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [tasks]);
}
