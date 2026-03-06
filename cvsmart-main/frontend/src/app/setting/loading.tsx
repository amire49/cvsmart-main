import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="app-page min-h-screen bg-background overflow-hidden">
      <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-primary rounded-full filter blur-[150px] opacity-30 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-success rounded-full filter blur-[150px] opacity-30 animate-pulse" />
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-10 w-56 rounded-xl" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
        <div className="mb-6">
          <Skeleton className="h-12 w-full max-w-2xl rounded-xl" />
        </div>
        <div className="bg-card backdrop-blur-lg border border-border rounded-2xl p-6">
          <Skeleton className="h-6 w-40 rounded-lg mb-4" />
          <Skeleton className="h-4 w-64 rounded-lg mb-6" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
