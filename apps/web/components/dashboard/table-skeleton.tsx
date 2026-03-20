'use client';

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="tenant-table-shell">
      <div className="tenant-table-row tenant-table-head">
        <div className="tenant-skeleton h-4 w-28" />
        <div className="tenant-skeleton h-4 w-28" />
        <div className="tenant-skeleton h-4 w-28" />
        <div className="tenant-skeleton h-4 w-24" />
        <div className="tenant-skeleton h-4 w-24" />
      </div>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="tenant-table-row">
          <div className="tenant-skeleton h-4 w-32" />
          <div className="tenant-skeleton h-4 w-24" />
          <div className="tenant-skeleton h-4 w-36" />
          <div className="tenant-skeleton h-4 w-20" />
          <div className="tenant-skeleton h-4 w-20" />
        </div>
      ))}
    </div>
  );
}
