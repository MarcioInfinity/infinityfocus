import { Skeleton } from "@/components/ui/skeleton";

export function ProjectListSkeleton() {
  return (
    <div className="space-y-2">
      {/* Create button skeleton */}
      <Skeleton className="w-full h-10 rounded-lg" />
      
      {/* Project items skeleton */}
      <div className="space-y-1">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="p-3 rounded-lg border border-border">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2 flex-1">
                <Skeleton className="w-3 h-3 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-5 w-8 rounded" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-8" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="w-full h-1 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}