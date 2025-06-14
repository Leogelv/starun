export interface Subtopic {
    id: number;
    name: string;
    created_at: string;
}

export interface MeditationMaterial {
    id: number;
    message_link: string;
    material_name: string;
    description: string;
    created_at: string;
    subtopic_id: number;
} 