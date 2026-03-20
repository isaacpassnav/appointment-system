'use client';

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="tenant-empty-state">
      <p className="tenant-empty-title">{title}</p>
      <p className="tenant-empty-description">{description}</p>
    </div>
  );
}
