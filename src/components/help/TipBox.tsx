import { Lightbulb, AlertTriangle, Info } from 'lucide-react';

const variants = {
    tip: {
        bg: 'bg-teal-50 dark:bg-teal-950/20',
        border: 'border-teal-200/50 dark:border-teal-800/30',
        text: 'text-teal-700 dark:text-teal-300',
        icon: Lightbulb,
    },
    warning: {
        bg: 'bg-amber-50 dark:bg-amber-950/20',
        border: 'border-amber-200/50 dark:border-amber-800/30',
        text: 'text-amber-700 dark:text-amber-300',
        icon: AlertTriangle,
    },
    info: {
        bg: 'bg-blue-50 dark:bg-blue-950/20',
        border: 'border-blue-200/50 dark:border-blue-800/30',
        text: 'text-blue-700 dark:text-blue-300',
        icon: Info,
    },
};

export function TipBox({
    children,
    variant = 'tip',
}: {
    children: React.ReactNode;
    variant?: 'tip' | 'warning' | 'info';
}) {
    const v = variants[variant];
    const Icon = v.icon;

    return (
        <div className={`flex gap-3 p-4 rounded-xl border ${v.bg} ${v.border}`}>
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${v.text}`} />
            <div className={`text-sm leading-relaxed ${v.text}`}>{children}</div>
        </div>
    );
}
