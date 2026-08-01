import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  className?: string;
  key?: React.Key;
}

export function Input({ className, icon, ...props }: InputProps) {
  return (
    <div className="relative flex items-center">
      {icon && <span className="absolute left-4 text-brand-secondary/60">{icon}</span>}
      <input
        className={cn(
          'w-full neu-pressed rounded-xl px-4 py-3 bg-transparent border-none outline-none text-brand-secondary placeholder:text-brand-secondary/50',
          icon && 'pl-12',
          className
        )}
        {...props}
      />
    </div>
  );
}
