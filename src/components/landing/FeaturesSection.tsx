/**
 * @file FeaturesSection.tsx
 * @description Seção de funcionalidades com cards horizontais Netflix-style.
 */

import { Search, Box, Smartphone, Lock, Zap } from 'lucide-react';
import { FeatureRow, FeatureCard } from './SharedLandingComponents';

interface FeaturesSectionProps {
    title: string;
    viewAllText: string;
    features: {
        search: { title: string; desc: string };
        moving: { title: string; desc: string };
        multi_device: { title: string; desc: string };
        security: { title: string; desc: string };
    };
}

export function FeaturesSection({ title, viewAllText, features }: FeaturesSectionProps) {
    return (
        <FeatureRow id="features" title={title} viewAllText={viewAllText} icon={<Zap className="text-yellow-500" />}>
            <FeatureCard title={features.search.title} description={features.search.desc} icon={<Search className="w-10 h-10 text-blue-400" />} />
            <FeatureCard title={features.moving.title} description={features.moving.desc} icon={<Box className="w-10 h-10 text-amber-600" />} />
            <FeatureCard title={features.multi_device.title} description={features.multi_device.desc} icon={<Smartphone className="w-10 h-10 text-green-400" />} />
            <FeatureCard title={features.security.title} description={features.security.desc} icon={<Lock className="w-10 h-10 text-red-500" />} />
        </FeatureRow>
    );
}
