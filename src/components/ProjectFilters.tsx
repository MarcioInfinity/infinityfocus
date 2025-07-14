
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Users, Eye } from 'lucide-react';

interface ProjectFiltersProps {
  activeFilter: 'all' | 'owned' | 'member';
  onFilterChange: (filter: 'all' | 'owned' | 'member') => void;
  projectCounts?: {
    all: number;
    owned: number;
    member: number;
  };
}

export function ProjectFilters({ 
  activeFilter, 
  onFilterChange, 
  projectCounts 
}: ProjectFiltersProps) {
  const filters = [
    {
      key: 'all' as const,
      label: 'Todos',
      icon: Eye,
      description: 'Todos os projetos'
    },
    {
      key: 'owned' as const,
      label: 'Meus Projetos',
      icon: Crown,
      description: 'Projetos que você criou'
    },
    {
      key: 'member' as const,
      label: 'Participando',
      icon: Users,
      description: 'Projetos em que você participa'
    }
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {filters.map((filter) => {
        const isActive = activeFilter === filter.key;
        const count = projectCounts?.[filter.key];
        const Icon = filter.icon;

        return (
          <Button
            key={filter.key}
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterChange(filter.key)}
            className={`
              flex items-center gap-2
              ${isActive ? 'glow-button' : 'neon-border hover:border-primary/50'}
            `}
          >
            <Icon className="w-4 h-4" />
            <span>{filter.label}</span>
            {count !== undefined && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {count}
              </Badge>
            )}
          </Button>
        );
      })}
    </div>
  );
}
