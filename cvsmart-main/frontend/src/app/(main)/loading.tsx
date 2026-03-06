import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="app-page min-h-screen bg-background text-foreground overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary rounded-full filter blur-[150px] opacity-20" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-success rounded-full filter blur-[150px] opacity-20" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-ring rounded-full filter blur-[150px] opacity-10" />
      </div>
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
