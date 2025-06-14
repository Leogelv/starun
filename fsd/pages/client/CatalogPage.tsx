"use client"
import { useState, useEffect } from 'react';
import { Subtopic, MeditationMaterial } from '@/fsd/shared/types/meditation';
import { MaterialCard } from '@/fsd/shared/components/MaterialCard';

export function CatalogPage() {
    const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
    const [materials, setMaterials] = useState<MeditationMaterial[]>([]);
    const [selectedSubtopic, setSelectedSubtopic] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubtopics();
        fetchMaterials();
    }, []);

    useEffect(() => {
        fetchMaterials(selectedSubtopic);
    }, [selectedSubtopic]);

    const fetchSubtopics = async () => {
        try {
            const response = await fetch('/api/subtopics');
            const data = await response.json();
            setSubtopics(data);
        } catch (error) {
            console.error('Error fetching subtopics:', error);
        }
    };

    const fetchMaterials = async (subtopicId?: number | null) => {
        setLoading(true);
        try {
            const url = subtopicId 
                ? `/api/materials?subtopic_id=${subtopicId}`
                : '/api/materials';
            const response = await fetch(url);
            const data = await response.json();
            setMaterials(data);
        } catch (error) {
            console.error('Error fetching materials:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenLink = (link: string) => {
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.openLink(link, { try_instant_view: true });
        } else {
            window.open(link, '_blank');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
            {/* Categories */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-lg border-b border-purple-100 z-10">
                <div className="px-4 py-3 overflow-x-auto">
                    <div className="flex gap-3 min-w-max">
                        <button
                            onClick={() => setSelectedSubtopic(null)}
                            className={`px-6 py-2 rounded-full font-medium transition-all ${
                                selectedSubtopic === null
                                    ? 'bg-purple-600 text-white shadow-lg'
                                    : 'bg-white text-gray-700 border border-gray-200 hover:border-purple-300'
                            }`}
                        >
                            Все
                        </button>
                        {subtopics.map((subtopic) => (
                            <button
                                key={subtopic.id}
                                onClick={() => setSelectedSubtopic(subtopic.id)}
                                className={`px-6 py-2 rounded-full font-medium transition-all whitespace-nowrap ${
                                    selectedSubtopic === subtopic.id
                                        ? 'bg-purple-600 text-white shadow-lg'
                                        : 'bg-white text-gray-700 border border-gray-200 hover:border-purple-300'
                                }`}
                            >
                                {subtopic.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Materials Grid */}
            <div className="px-4 py-6">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    </div>
                ) : materials.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Материалы не найдены</p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {materials.map((material) => (
                            <MaterialCard
                                key={material.id}
                                material={material}
                                onOpenLink={handleOpenLink}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
} 