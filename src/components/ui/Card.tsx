import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import styles from './Card.module.css';

const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (<div ref={ref} className={cn(styles.card, className)} {...props} />)
);
Card.displayName = 'Card';

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (<div ref={ref} className={cn(styles.header, className)} {...props} />)
);
CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (<h3 ref={ref} className={cn(styles.title, className)} {...props} />)
);
CardTitle.displayName = 'CardTitle';

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (<div ref={ref} className={cn(styles.content, className)} {...props} />)
);
CardContent.displayName = 'CardContent';

const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => (<p ref={ref} className={cn("text-sm text-gray-400", className)} {...props} />)
);
CardDescription.displayName = 'CardDescription';

export { Card, CardHeader, CardTitle, CardContent, CardDescription };
