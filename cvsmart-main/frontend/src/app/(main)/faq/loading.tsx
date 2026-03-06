import { Skeleton } from "@/components/ui/skeleton";

export default function FAQLoading() {
  return (
    <div className="app-page min-h-screen bg-background text-foreground overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary rounded-full filter blur-[150px] opacity-20" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-success rounded-full filter blur-[150px] opacity-20" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-ring rounded-full filter blur-[150px] opacity-10" />
      </div>
      <header className="relative z-10 py-12 px-4 border-b border-border backdrop-blur-md">
        <div className="container mx-auto max-w-4xl">
          <div className="flex justify-center mb-6">
            <Skeleton className="h-12 w-12 rounded-xl" />
          </div>
          <Skeleton className="h-10 w-80 max-w-full mx-auto rounded-xl mb-4" />
          <Skeleton className="h-5 w-96 max-w-full mx-auto rounded-lg" />
        </div>
      </header>
      <main className="relative z-10 container mx-auto max-w-4xl p-6 md:p-8 py-12">
        <div className="mb-12">
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="bg-card/80 backdrop-blur-sm border border-border rounded-xl overflow-hidden p-6"
            >
              <Skeleton className="h-6 w-full rounded-lg mb-2" />
              <Skeleton className="h-4 w-3/4 rounded-lg" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
