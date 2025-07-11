
import { toast } from 'sonner';

export const useToastNotifications = () => {
  const showSuccessToast = (message: string, description?: string) => {
    toast.success(message, {
      description,
      position: window.innerWidth < 768 ? 'top-center' : 'bottom-right',
      duration: 2000,
      style: {
        background: 'rgba(16, 185, 129, 0.1)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        color: 'rgb(16, 185, 129)',
      }
    });
  };

  const showErrorToast = (message: string, description?: string) => {
    toast.error(message, {
      description,
      position: window.innerWidth < 768 ? 'top-center' : 'bottom-right',
      duration: 2000,
      style: {
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        color: 'rgb(239, 68, 68)',
      }
    });
  };

  const showInfoToast = (message: string, description?: string) => {
    toast.info(message, {
      description,
      position: window.innerWidth < 768 ? 'top-center' : 'bottom-right',
      duration: 2000,
      style: {
        background: 'rgba(59, 130, 246, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        color: 'rgb(59, 130, 246)',
      }
    });
  };

  return {
    showSuccessToast,
    showErrorToast,
    showInfoToast
  };
};
