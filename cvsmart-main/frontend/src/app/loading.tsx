import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="app-page min-h-screen bg-background overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary rounded-full filter blur-[150px] opacity-20" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-success rounded-full filter blur-[150px] opacity-20" />
      </div>
      <nav className="relative z-10 border-b border-border backdrop-blur-md">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-6 w-24 rounded-md" />
          </div>
          <div className="flex gap-6">
            <Skeleton className="h-5 w-16 rounded-md" />
            <Skeleton className="h-5 w-24 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </div>
      </nav>
      <div className="relative z-10 container mx-auto px-6 py-24 max-w-3xl">
        <Skeleton className="h-12 w-full max-w-xl mx-auto rounded-xl mb-4" />
        <Skeleton className="h-6 w-3/4 max-w-md mx-auto rounded-lg mb-8" />
        <div className="flex justify-center gap-4">
          <Skeleton className="h-11 w-32 rounded-full" />
          <Skeleton className="h-11 w-32 rounded-full" />
        </div>
      </div>
    </div>
  );
}
