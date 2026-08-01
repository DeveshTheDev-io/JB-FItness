import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'flat' | 'pressed' | 'convex' | 'concave';
  children?: React.ReactNode;
  className?: string;
  key?: React.Key;
}

export function Card({ className, variant = 'flat', children, ...props }: CardProps) {
  const baseClasses = 'p-6 rounded-2xl';
  const variantClasses = {
    flat: 'neu-flat',
    pressed: 'neu-pressed',
    convex: 'neu-convex',
    concave: 'neu-concave',
  };

  return (
    <div className={cn(baseClasses, variantClasses[variant], className)} {...props}>
      {children}
    </div>
  );
}
