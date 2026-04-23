export function StatsCardSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border p-4 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="w-7 h-7 bg-muted rounded-lg" />
      </div>
      <div className="h-7 bg-muted rounded w-1/2 mb-1" />
      <div className="h-3 bg-muted rounded w-3/4" />
    </div>
  );
}

export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <tr className="border-b border-border">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-muted rounded animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
        </td>
      ))}
    </tr>
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={`bg-card rounded-xl border border-border p-5 animate-pulse ${className}`}>
      <div className="h-5 bg-muted rounded w-1/3 mb-4" />
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded" />
        <div className="h-4 bg-muted rounded w-4/5" />
        <div className="h-4 bg-muted rounded w-3/5" />
      </div>
    </div>
  );
}
