
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ProjectForm } from '@/components/forms/ProjectForm';
import { Project } from '@/types';

interface EditProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: any) => void;
}

export function EditProjectModal({ project, isOpen, onClose, onSave }: EditProjectModalProps) {
  if (!project) return null;

  const handleSubmit = (formData: any) => {
    onSave({
      id: project.id,
      ...formData,
    });
    onClose();
  };

  const initialData = {
    name: project.name,
    description: project.description || '',
    priority: project.priority,
    category: project.category,
    color: project.color,
    is_shared: project.is_shared,
    start_date: project.start_date ? new Date(project.start_date) : undefined,
    due_date: project.due_date ? new Date(project.due_date) : undefined,
    is_indefinite: project.is_indefinite || false,
    start_time: project.start_time || '',
    end_time: project.end_time || '',
    notifications_enabled: project.notifications_enabled,
    repeat_enabled: project.repeat_enabled,
    repeat_type: project.repeat_type,
    repeat_days: project.repeat_days || [],
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Projeto</DialogTitle>
        </DialogHeader>
        <ProjectForm
          onSubmit={handleSubmit}
          onCancel={onClose}
          initialData={initialData}
        />
      </DialogContent>
    </Dialog>
  );
}
