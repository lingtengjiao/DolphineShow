interface TableSkeletonProps {
  rows?: number
  cols?: number
}

export default function TableSkeleton({ rows = 5, cols = 5 }: TableSkeletonProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden animate-pulse">
      <div className="grid gap-px bg-gray-100/50">
        {/* Header */}
        <div className="bg-gray-50/80 px-5 py-3.5 flex gap-6">
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="h-3 bg-gray-200 rounded-full" style={{ width: `${60 + Math.random() * 60}px` }} />
          ))}
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="bg-white px-5 py-4 flex items-center gap-6">
            {Array.from({ length: cols }).map((_, c) => (
              <div key={c} className="h-3 bg-gray-100 rounded-full" style={{ width: `${40 + Math.random() * 80}px` }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
