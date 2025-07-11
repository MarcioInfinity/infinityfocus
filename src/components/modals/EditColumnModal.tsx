
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Palette, Bell, Trash2, AlertTriangle } from 'lucide-react';
import { KanbanColumn } from '@/types';

interface EditColumnModalProps {
  column: KanbanColumn;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedColumn: KanbanColumn) => void;
  onDelete: (columnId: string) => void;
}

const colorOptions = [
  { name: 'Vermelho', value: '#ef4444', bg: 'bg-red-500' },
  { name: 'Amarelo', value: '#f59e0b', bg: 'bg-yellow-500' },
  { name: 'Azul', value: '#3b82f6', bg: 'bg-blue-500' },
  { name: 'Verde', value: '#10b981', bg: 'bg-green-500' },
  { name: 'Rosa', value: '#ec4899', bg: 'bg-pink-500' },
  { name: 'Roxo', value: '#8b5cf6', bg: 'bg-purple-500' },
  { name: 'Lilás', value: '#a855f7', bg: 'bg-violet-500' },
  { name: 'Preto', value: '#1f2937', bg: 'bg-gray-800' },
  { name: 'Branco', value: '#f9fafb', bg: 'bg-gray-100' },
  { name: 'Laranja', value: '#f97316', bg: 'bg-orange-500' }
];

export function EditColumnModal({ column, isOpen, onClose, onSave, onDelete }: EditColumnModalProps) {
  const [formData, setFormData] = useState({
    title: column.title,
    color: column.color,
    notifications_enabled: column.notifications_enabled || false,
    notification_days: column.notification_days || 3
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = () => {
    const updatedColumn: KanbanColumn = {
      ...column,
      title: formData.title,
      color: formData.color,
      notifications_enabled: formData.notifications_enabled,
      notification_days: formData.notification_days
    };
    onSave(updatedColumn);
    onClose();
  };

  const handleDelete = () => {
    onDelete(column.id);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md glass-card">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Editar Coluna
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="title">Nome da Coluna</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="neon-border"
            />
          </div>

          {/* Cor */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Cor da Coluna
            </Label>
            <div className="grid grid-cols-5 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData({...formData, color: color.value})}
                  className={`w-12 h-12 rounded-lg border-2 transition-all hover:scale-105 ${color.bg} ${
                    formData.color === color.value 
                      ? 'border-primary ring-2 ring-primary/50' 
                      : 'border-gray-300'
                  }`}
                  title={color.name}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Cor selecionada: {colorOptions.find(c => c.value === formData.color)?.name}
            </p>
          </div>

          {/* Notificações */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Notificações
              </Label>
              <Switch
                checked={formData.notifications_enabled}
                onCheckedChange={(checked) => setFormData({...formData, notifications_enabled: checked})}
              />
            </div>

            {formData.notifications_enabled && (
              <div className="glass-card p-3 space-y-3">
                <Label htmlFor="notification_days">
                  Notificar quando tarefa ficar mais de X dias sem movimentação
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="notification_days"
                    type="number"
                    min="1"
                    max="30"
                    value={formData.notification_days}
                    onChange={(e) => setFormData({...formData, notification_days: parseInt(e.target.value) || 1})}
                    className="neon-border w-20"
                  />
                  <span className="text-sm text-muted-foreground">dias</span>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Zona de Risco */}
          <div className="glass-card p-4 space-y-3 border border-red-500/30">
            <h3 className="font-semibold text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Zona de Risco
            </h3>
            <p className="text-sm text-muted-foreground">
              Excluir esta coluna removerá todas as tarefas contidas nela.
            </p>
            
            {!showDeleteConfirm ? (
              <Button 
                variant="destructive" 
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full"
                size="sm"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir Coluna
              </Button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-medium text-red-400">
                  Tem certeza? Esta ação não pode ser desfeita.
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1"
                    size="sm"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleDelete}
                    className="flex-1"
                    size="sm"
                  >
                    Confirmar
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1 neon-border">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="flex-1 glow-button">
              Salvar Alterações
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
