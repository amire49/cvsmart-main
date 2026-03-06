import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="app-page min-h-screen bg-background text-foreground overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary rounded-full filter blur-[150px] opacity-20" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-success rounded-full filter blur-[150px] opacity-20" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-ring rounded-full filter blur-[150px] opacity-10" />
      </div>
      <div className="container mx-auto py-16 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-md" />
              <Skeleton className="h-9 w-40 rounded-lg" />
            </div>
          </div>
          <div className="mb-6">
            <Skeleton className="h-10 w-full max-w-md rounded-lg" />
          </div>
          <div className="space-y-6">
            <div className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-20 rounded-xl" />
                ))}
              </div>
            </div>
            <div className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-6">
              <Skeleton className="h-6 w-40 rounded-lg mb-4" />
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
