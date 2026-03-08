/**
 * @file Textarea.tsx
 * @description Textarea component — theme-responsive for admin do solucoesrkm.
 */

import { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> { }

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, ...props }, ref) => (
        <textarea
            ref={ref}
            className={cn(
                'w-full rounded-lg border border-gray-200 dark:border-white/15 bg-white dark:bg-transparent px-4 py-3 text-sm text-gray-900 dark:text-gray-200',
                'placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-indigo-500',
                'focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50',
                'resize-y min-h-[80px] transition-all',
                className
            )}
            {...props}
        />
    )
);
Textarea.displayName = 'Textarea';

export { Textarea };
