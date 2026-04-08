'use client';

import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type PasswordVisibilityToggleProps = {
  visible: boolean;
  onToggle: () => void;
  visibleLabel: string;
  hiddenLabel: string;
  className?: string;
};

export function PasswordVisibilityToggle({
  visible,
  onToggle,
  visibleLabel,
  hiddenLabel,
  className,
}: PasswordVisibilityToggleProps) {
  const label = visible ? visibleLabel : hiddenLabel;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn('password-toggle', className)}
      onClick={onToggle}
      aria-label={label}
      title={label}
    >
      {visible ? (
        <EyeOff className="h-4 w-4" aria-hidden={true} />
      ) : (
        <Eye className="h-4 w-4" aria-hidden={true} />
      )}
      <span className="sr-only">{label}</span>
    </Button>
  );
}
