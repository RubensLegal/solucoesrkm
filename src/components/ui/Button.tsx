/**
 * @file Button.tsx
 * @description Componente Button reutilizável com variants e sizes.
 *
 * Suporta: primary, secondary, outline, ghost, destructive
 * Sizes: sm, md, lg, icon
 * Features: loading spinner, href (render como <a>)
 */

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    loading?: boolean;
    href?: string;
}

const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', loading, href, children, ...props }, ref) => {
        const isDisabled = props.disabled || loading;

        const content = loading ? (
            <>
                <span className={styles.spinner} aria-hidden />
                {children}
            </>
        ) : children;

        // Renderiza como <a> se href for fornecido
        if (href) {
            return (
                <a
                    ref={ref as any}
                    href={href}
                    className={cn(styles.button, styles[variant], styles[size], className)}
                    aria-disabled={isDisabled}
                    {...props as any}
                >
                    {content}
                </a>
            );
        }

        return (
            <button
                ref={ref as any}
                className={cn(styles.button, styles[variant], styles[size], className)}
                disabled={isDisabled}
                {...props}
            >
                {content}
            </button>
        );
    }
);
Button.displayName = 'Button';

export { Button };
