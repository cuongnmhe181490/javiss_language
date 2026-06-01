import { Skeleton } from "@/components/ui/skeleton";

export default function LessonLoading() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="border-b border-white/5 bg-slate-950/80">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Skeleton className="h-5 w-20 bg-white/10" />
          <Skeleton className="h-5 w-16 bg-white/10" />
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Skeleton className="mb-3 h-6 w-32 bg-white/10" />
        <Skeleton className="mb-3 h-9 w-2/3 bg-white/10" />
        <Skeleton className="mb-8 h-4 w-full bg-white/10" />
        <Skeleton className="mb-8 h-32 rounded-2xl bg-white/10" />
        <Skeleton className="mb-3 h-24 rounded-2xl bg-white/10" />
        <Skeleton className="h-24 rounded-2xl bg-white/10" />
      </div>
    </main>
  );
}
