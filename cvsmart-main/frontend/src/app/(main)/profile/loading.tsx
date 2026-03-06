import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="app-page min-h-screen bg-background text-foreground overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary rounded-full filter blur-[150px] opacity-20" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-success rounded-full filter blur-[150px] opacity-20" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-ring rounded-full filter blur-[150px] opacity-10" />
      </div>
      <div className="container mx-auto py-10 px-4 md:px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-card backdrop-blur-sm border border-border rounded-2xl p-6">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <div className="flex gap-3 mt-4 md:mt-0">
            <Skeleton className="h-10 w-24 rounded-xl" />
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-8">
            <div className="bg-card backdrop-blur-sm border border-border rounded-2xl p-8">
              <div className="flex flex-col items-center">
                <Skeleton className="h-36 w-36 rounded-full mb-6" />
                <Skeleton className="h-6 w-40 rounded-lg mb-2" />
                <Skeleton className="h-4 w-28 rounded-lg mb-6" />
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            </div>
            <div className="bg-card backdrop-blur-sm border border-border rounded-2xl p-6">
              <Skeleton className="h-5 w-32 rounded-lg mb-4" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card backdrop-blur-sm border border-border rounded-2xl p-6">
              <Skeleton className="h-6 w-48 rounded-lg mb-4" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-xl" />
                ))}
              </div>
            </div>
            <div className="bg-card backdrop-blur-sm border border-border rounded-2xl p-6">
              <Skeleton className="h-6 w-36 rounded-lg mb-4" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
