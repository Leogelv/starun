"use client"
import { MeditationMaterial } from '@/fsd/shared/types/meditation';
import { ExternalLink } from 'lucide-react';

interface MaterialCardProps {
    material: MeditationMaterial;
    onOpenLink: (link: string) => void;
}

export function MaterialCard({ material, onOpenLink }: MaterialCardProps) {
    return (
        <div 
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-purple-300/20 hover:border-purple-400/40 transition-all duration-300 cursor-pointer group"
            onClick={() => onOpenLink(material.message_link)}
        >
            <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-purple-700 transition-colors">
                    {material.material_name}
                </h3>
                <ExternalLink className="w-5 h-5 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-gray-600 text-sm line-clamp-3">
                {material.description}
            </p>
        </div>
    );
} 