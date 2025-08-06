import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ProjectForm } from '@/components/forms/ProjectForm';
import { useProjects } from '@/hooks/useProjects';
import { useToastNotifications } from '@/hooks/use-toast-notifications';
import { Project } from '@/types';

interface EditProjectModalProps {
  projectId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditProjectModal({ projectId, isOpen, onClose }: EditProjectModalProps) {
  const { projects, updateProject } = useProjects();
  const { showSuccessToast, showErrorToast } = useToastNotifications();
  const [projectData, setProjectData] = useState<Project | null>(null);

  useEffect(() => {
    if (projectId && isOpen) {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        setProjectData(project);
      }
    }
  }, [projectId, projects, isOpen]);

  const handleSubmit = async (data: Project) => {
    if (!projectId) return;

    try {
      await updateProject({
        id: projectId,
        updates: data
      });
      showSuccessToast('Projeto atualizado com sucesso!');
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar projeto:', error);
      showErrorToast('Erro ao atualizar projeto. Tente novamente.');
    }
  };

  const handleCancel = () => {
    setProjectData(null);
    onClose();
  };

  if (!projectData) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Projeto</DialogTitle>
        </DialogHeader>
        <ProjectForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          initialData={projectData}
        />
      </DialogContent>
    </Dialog>
  );
}

