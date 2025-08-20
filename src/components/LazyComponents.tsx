import { lazy } from 'react';

// Lazy load dos componentes mais pesados
export const LazyProjectManager = lazy(() => 
  import('@/components/ProjectManager').then(module => ({ default: module.ProjectManager }))
);
export const LazyKanbanBoard = lazy(() => 
  import('@/components/KanbanBoard').then(module => ({ default: module.KanbanBoard }))
);
export const LazyTaskManager = lazy(() => 
  import('@/components/TaskManager').then(module => ({ default: module.TaskManager }))
);
export const LazyGoals = lazy(() => 
  import('@/components/Goals').then(module => ({ default: module.Goals }))
);
export const LazySettings = lazy(() => 
  import('@/components/Settings').then(module => ({ default: module.Settings }))
);
export const LazyDashboard = lazy(() => 
  import('@/components/Dashboard').then(module => ({ default: module.Dashboard }))
);

// Loading fallback component
export const ComponentLoadingFallback = () => (
  <div className="flex items-center justify-center h-64">
    <div className="flex flex-col items-center gap-2">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span className="text-sm text-muted-foreground">Carregando...</span>
    </div>
  </div>
);