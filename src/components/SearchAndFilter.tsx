
import { useState } from 'react';
import { Search, Filter, X, Calendar, Tag, User, Priority } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface FilterOptions {
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

interface SearchAndFilterProps {
  onFiltersChange: (filters: FilterOptions) => void;
  availableTags?: string[];
  showPriorityFilter?: boolean;
  showStatusFilter?: boolean;
  showCategoryFilter?: boolean;
  showDateFilter?: boolean;
  showTagFilter?: boolean;
}

export function SearchAndFilter({
  onFiltersChange,
  availableTags = [],
  showPriorityFilter = true,
  showStatusFilter = true,
  showCategoryFilter = true,
  showDateFilter = true,
  showTagFilter = true
}: SearchAndFilterProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: '',
    tags: []
  });

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const updateFilters = (newFilters: Partial<FilterOptions>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const clearFilters = () => {
    const clearedFilters: FilterOptions = {
      searchTerm: '',
      tags: []
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = filters.searchTerm || 
    filters.priority || 
    filters.category || 
    filters.status || 
    filters.dateRange?.from || 
    filters.tags.length > 0;

  const addTag = (tag: string) => {
    if (!filters.tags.includes(tag)) {
      updateFilters({ tags: [...filters.tags, tag] });
    }
  };

  const removeTag = (tag: string) => {
    updateFilters({ tags: filters.tags.filter(t => t !== tag) });
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar..."
          value={filters.searchTerm}
          onChange={(e) => updateFilters({ searchTerm: e.target.value })}
          className="pl-10 glass-card border-white/20"
        />
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-2">
        {showPriorityFilter && (
          <Select 
            value={filters.priority || ''} 
            onValueChange={(value) => updateFilters({ priority: value || undefined })}
          >
            <SelectTrigger className="w-[120px] glass-card border-white/20">
              <Priority className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent className="glass-card border-white/20">
              <SelectItem value="">Todas</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="low">Baixa</SelectItem>
            </SelectContent>
          </Select>
        )}

        {showStatusFilter && (
          <Select 
            value={filters.status || ''} 
            onValueChange={(value) => updateFilters({ status: value || undefined })}
          >
            <SelectTrigger className="w-[120px] glass-card border-white/20">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="glass-card border-white/20">
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value="todo">A fazer</SelectItem>
              <SelectItem value="in-progress">Em progresso</SelectItem>
              <SelectItem value="review">Revisão</SelectItem>
              <SelectItem value="done">Concluída</SelectItem>
            </SelectContent>
          </Select>
        )}

        {showCategoryFilter && (
          <Select 
            value={filters.category || ''} 
            onValueChange={(value) => updateFilters({ category: value || undefined })}
          >
            <SelectTrigger className="w-[120px] glass-card border-white/20">
              <Tag className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent className="glass-card border-white/20">
              <SelectItem value="">Todas</SelectItem>
              <SelectItem value="professional">Profissional</SelectItem>
              <SelectItem value="personal">Pessoal</SelectItem>
              <SelectItem value="health">Saúde</SelectItem>
              <SelectItem value="finance">Finanças</SelectItem>
              <SelectItem value="social">Social</SelectItem>
              <SelectItem value="other">Outros</SelectItem>
            </SelectContent>
          </Select>
        )}

        {showDateFilter && (
          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="glass-card border-white/20">
                <Calendar className="h-4 w-4 mr-2" />
                {filters.dateRange?.from ? (
                  filters.dateRange.to ? (
                    <>
                      {format(filters.dateRange.from, "dd/MM")} - {format(filters.dateRange.to, "dd/MM")}
                    </>
                  ) : (
                    format(filters.dateRange.from, "dd/MM/yyyy")
                  )
                ) : (
                  'Data'
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 glass-card border-white/20" align="start">
              <CalendarComponent
                initialFocus
                mode="range"
                defaultMonth={filters.dateRange?.from}
                selected={filters.dateRange}
                onSelect={(range) => updateFilters({ dateRange: range })}
                numberOfMonths={2}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        )}

        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="text-red-400 hover:text-red-300"
          >
            <X className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      {/* Tag Filter */}
      {showTagFilter && availableTags.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium">Tags:</div>
          <div className="flex flex-wrap gap-2">
            {availableTags.map(tag => (
              <Badge
                key={tag}
                variant={filters.tags.includes(tag) ? 'default' : 'outline'}
                className={cn(
                  'cursor-pointer transition-all',
                  filters.tags.includes(tag) 
                    ? 'bg-primary/20 text-primary border-primary/30' 
                    : 'hover:bg-primary/10'
                )}
                onClick={() => 
                  filters.tags.includes(tag) ? removeTag(tag) : addTag(tag)
                }
              >
                {tag}
                {filters.tags.includes(tag) && (
                  <X className="h-3 w-3 ml-1" />
                )}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.searchTerm && (
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
              Busca: "{filters.searchTerm}"
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => updateFilters({ searchTerm: '' })}
              />
            </Badge>
          )}
          {filters.priority && (
            <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">
              Prioridade: {filters.priority}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => updateFilters({ priority: undefined })}
              />
            </Badge>
          )}
          {filters.status && (
            <Badge variant="secondary" className="bg-green-500/20 text-green-400">
              Status: {filters.status}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => updateFilters({ status: undefined })}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
