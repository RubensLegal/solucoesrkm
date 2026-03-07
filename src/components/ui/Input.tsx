import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> { }

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, ...props }, ref) => (
        <input ref={ref} className={cn(styles.input, className)} {...props} />
    )
);
Input.displayName = 'Input';

export { Input };
