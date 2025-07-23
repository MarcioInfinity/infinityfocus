
import { useState, useCallback } from 'react';
import { useProjects } from './useProjects';

import { Project } from "@/types";

export function useProjectSelection(initialProjectId?: string) {
  const { projects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(initialProjectId);

  const selectedProject = projects.find(project => project.id === selectedProjectId);

  const selectProject = useCallback((projectId: string | undefined) => {
    setSelectedProjectId(projectId);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedProjectId(undefined);
  }, []);

  const getProjectById = useCallback((id: string) => {
    return projects.find(project => project.id === id);
  }, [projects]);

  const getProjectsByFilter = useCallback((filter: (project: Project) => boolean) => {
    return projects.filter(filter);
  }, [projects]);

  return {
    selectedProjectId,
    selectedProject,
    selectProject,
    clearSelection,
    getProjectById,
    getProjectsByFilter,
    allProjects: projects
  };
}
