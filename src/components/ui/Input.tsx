/**
 * @file Input.tsx
 * @description Input component — theme-responsive via Tailwind classes.
 */

import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> { }

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, ...props }, ref) => (
        <input
            ref={ref}
            className={cn(
                'w-full min-h-[3rem] rounded-lg border border-gray-200 dark:border-white/15 bg-white dark:bg-white/5 px-4 py-3 text-[0.9rem] text-gray-900 dark:text-gray-100',
                'placeholder:text-gray-400 dark:placeholder:text-gray-500',
                'focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-500/30',
                'dark:caret-teal-300',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'transition-all',
                className
            )}
            {...props}
        />
    )
);
Input.displayName = 'Input';

export { Input };
