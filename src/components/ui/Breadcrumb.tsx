'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem { label: string; href?: string; }

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    containerClasses?: string;
}

export function Breadcrumb({ items, containerClasses }: BreadcrumbProps) {
    return (
        <nav aria-label="breadcrumb" className={cn("w-full", containerClasses)}>
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
                <li className="flex items-center">
                    <Link href="/" className="transition-colors hover:text-purple-400 text-gray-400">
                        <Home className="w-4 h-4" />
                    </Link>
                </li>
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    return (
                        <React.Fragment key={index}>
                            <li className="flex items-center text-gray-500"><ChevronRight className="w-4 h-4" /></li>
                            <li>{isLast ? <span className="font-medium text-gray-900 dark:text-white">{item.label}</span> : <Link href={item.href || '#'} className="text-gray-400 hover:text-purple-400">{item.label}</Link>}</li>
                        </React.Fragment>
                    );
                })}
            </ol>
        </nav>
    );
}
