'use client';

import type { ReactNode } from 'react';

export function ModuleHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="tenant-module-header">
      <div>
        <h1 className="tenant-module-title">{title}</h1>
        <p className="tenant-module-description">{description}</p>
      </div>
      {actions ? <div className="tenant-module-actions">{actions}</div> : null}
    </div>
  );
}
