interface SkeletonProps {
  cantidad?: number
  className?: string
}

export function Skeleton({
  cantidad = 6,
  className = 'h-48',
}: SkeletonProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: cantidad }).map((_, idx) => (
        <div
          key={idx}
          className={`animate-pulse rounded-xl bg-slate-200 ${className}`}
        />
      ))}
    </div>
  )
}