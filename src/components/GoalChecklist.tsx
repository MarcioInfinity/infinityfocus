
import { useState } from 'react';
import { Plus, Check, X, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { useChecklists } from '@/hooks/useChecklists';
import { ChecklistItem } from '@/types';

interface GoalChecklistProps {
  goalId: string;
}

export function GoalChecklist({ goalId }: GoalChecklistProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const { 
    checklist, 
    isLoading, 
    createItem, 
    updateItem, 
    deleteItem,
    isCreating,
    isUpdating 
  } = useChecklists(goalId, 'goal');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;

    createItem({
      title: newItemTitle.trim(),
      position: checklist.length
    });

    setNewItemTitle('');
    setIsAdding(false);
  };

  const handleToggleComplete = (item: ChecklistItem) => {
    updateItem({
      id: item.id,
      updates: { completed: !item.completed }
    });
  };

  const handleDeleteItem = (itemId: string) => {
    deleteItem(itemId);
  };

  const completedCount = checklist.filter(item => item.completed).length;
  const progressPercentage = checklist.length > 0 ? (completedCount / checklist.length) * 100 : 0;

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-8 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardContent className="p-4 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg">Checklist</h3>
            <span className="text-sm text-muted-foreground">
              {completedCount}/{checklist.length}
            </span>
          </div>
          
          {checklist.length > 0 && (
            <div className="w-full bg-muted rounded-full h-2 mb-4">
              <div 
                className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          {checklist.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-move" />
              
              <Checkbox
                checked={item.completed}
                onCheckedChange={() => handleToggleComplete(item)}
                disabled={isUpdating}
                className="shrink-0"
              />
              
              <span 
                className={`flex-1 text-sm ${
                  item.completed 
                    ? 'line-through text-muted-foreground' 
                    : 'text-foreground'
                }`}
              >
                {item.title}
              </span>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteItem(item.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive h-8 w-8 p-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        {isAdding ? (
          <form onSubmit={handleSubmit} className="space-y-2">
            <Input
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              placeholder="Digite o item do checklist..."
              autoFocus
              className="text-sm"
            />
            <div className="flex gap-2">
              <Button 
                type="submit" 
                size="sm" 
                disabled={!newItemTitle.trim() || isCreating}
                className="glow-button"
              >
                <Check className="w-4 h-4 mr-1" />
                {isCreating ? 'Adicionando...' : 'Adicionar'}
              </Button>
              <Button 
                type="button" 
                size="sm" 
                variant="outline"
                onClick={() => {
                  setIsAdding(false);
                  setNewItemTitle('');
                }}
              >
                <X className="w-4 h-4 mr-1" />
                Cancelar
              </Button>
            </div>
          </form>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="w-full neon-border"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar item ao checklist
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
