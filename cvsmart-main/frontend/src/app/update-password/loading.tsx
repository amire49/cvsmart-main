import { Skeleton } from "@/components/ui/skeleton";

export default function AuthLoading() {
  return (
    <div className="app-page min-h-screen flex flex-col items-center justify-center bg-background overflow-hidden py-8 px-4 sm:px-6 lg:px-8">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary rounded-full filter blur-[150px] opacity-20" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-success rounded-full filter blur-[150px] opacity-20" />
      </div>
      <div className="absolute top-4 right-4 z-20">
        <Skeleton className="h-9 w-9 rounded-full" />
      </div>
      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center text-center mb-6">
          <Skeleton className="h-14 w-14 rounded-2xl" />
          <Skeleton className="h-9 w-48 rounded-xl mt-4" />
          <Skeleton className="h-4 w-48 rounded-lg mt-2" />
          <Skeleton className="h-6 w-36 rounded-full mt-3" />
        </div>
        <div className="bg-card/80 backdrop-blur-md border border-border rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="space-y-5">
            <div className="space-y-2">
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-36 rounded" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
            <Skeleton className="h-11 w-full rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
