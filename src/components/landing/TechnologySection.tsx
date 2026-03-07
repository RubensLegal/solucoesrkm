/**
 * @file TechnologySection.tsx
 * @description Seção de tecnologia com cards Netflix-style.
 */

import { Monitor, Zap, Plus } from 'lucide-react';
import { FeatureRow, FeatureCard } from './SharedLandingComponents';

interface TechnologySectionProps {
    title: string;
    viewAllText: string;
    features: {
        tech: { title: string; desc: string };
        user_focus: { title: string; desc: string };
        innovation: { title: string; desc: string };
    };
}

export function TechnologySection({ title, viewAllText, features }: TechnologySectionProps) {
    return (
        <FeatureRow id="about" title={title} viewAllText={viewAllText} icon={<Monitor className="text-blue-500" />}>
            <FeatureCard title={features.tech.title} description={features.tech.desc} icon={<Zap className="w-10 h-10 text-purple-400" />} />
            <FeatureCard title={features.user_focus.title} description={features.user_focus.desc} icon={<Monitor className="w-10 h-10 text-cyan-400" />} />
            <FeatureCard title={features.innovation.title} description={features.innovation.desc} icon={<Plus className="w-10 h-10 text-white" />} />
        </FeatureRow>
    );
}
