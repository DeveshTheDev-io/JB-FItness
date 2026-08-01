import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'icon';
  children?: React.ReactNode;
  className?: string;
  key?: React.Key;
}

export function Button({ className, variant = 'default', children, ...props }: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center';
  
  const variantClasses = {
    default: 'neu-btn px-6 py-3',
    primary: 'neu-btn-primary px-6 py-3',
    icon: 'neu-flat active:neu-pressed p-3 rounded-full transition-all duration-300 text-brand-secondary',
  };

  return (
    <button className={cn(baseClasses, variantClasses[variant], className)} {...props}>
      {children}
    </button>
  );
}
