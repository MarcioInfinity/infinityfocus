
import React from 'react';
import { Check, ChevronDown, FolderKanban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useProjects } from '@/hooks/useProjects';

interface ProjectSelectorProps {
  value?: string;
  onValueChange: (value: string | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function ProjectSelector({ 
  value, 
  onValueChange, 
  placeholder = "Selecionar projeto...",
  className,
  disabled = false 
}: ProjectSelectorProps) {
  const { projects, isLoading } = useProjects();
  const [open, setOpen] = React.useState(false);

  const selectedProject = projects.find(project => project.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || isLoading}
          className={cn(
            "w-full justify-between neon-border",
            !value && "text-muted-foreground",
            className
          )}
        >
          <div className="flex items-center gap-2">
            <FolderKanban className="w-4 h-4" />
            {selectedProject ? (
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedProject.color }}
                />
                <span className="truncate">{selectedProject.name}</span>
              </div>
            ) : (
              placeholder
            )}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 glass-card border-white/20">
        <Command>
          <CommandInput placeholder="Buscar projeto..." />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Carregando projetos..." : "Nenhum projeto encontrado."}
            </CommandEmpty>
            <CommandGroup>
              {value && (
                <CommandItem
                  onSelect={() => {
                    onValueChange(undefined);
                    setOpen(false);
                  }}
                  className="text-muted-foreground"
                >
                  <Check className="mr-2 h-4 w-4 opacity-0" />
                  Nenhum projeto
                </CommandItem>
              )}
              {projects.map((project) => (
                <CommandItem
                  key={project.id}
                  value={project.id}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? undefined : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === project.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex items-center gap-2 flex-1">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="truncate">{project.name}</span>
                    {project.description && (
                      <span className="text-xs text-muted-foreground truncate">
                        - {project.description}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
