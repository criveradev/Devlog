/** Primitivas visuales que preservan la geometría mientras llegan datos remotos. */
function Skeleton({ className = "" }) {
  return (
    <div
      className={`bg-linear-to-r from-slate-200 via-slate-100 to-slate-200 
      bg-size-[200%_100%] animate-[shimmer_1.5s_infinite] rounded-lg ${className}`}
    />
  );
}

/** Placeholder de una publicación completa. */
export function PostSkeleton() {
  return (
    <div className="surface-card p-5 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-2.5 w-20" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-3/4" />
      </div>
      <Skeleton className="h-56 w-full rounded-2xl" />
      <div className="flex gap-4 pt-1">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

/** Placeholder del encabezado de un perfil. */
export function ProfileSkeleton() {
  return (
    <div className="surface-card p-5">
      <div className="flex items-center gap-4">
        <Skeleton className="w-16 h-16 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-48" />
          <div className="flex gap-4 pt-1">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-18" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Skeleton;
