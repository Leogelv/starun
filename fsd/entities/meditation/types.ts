export interface Material {
  id: number;
  message_link: string;
  material_name: string;
  description: string | null;
  created_at: string;
  subtopic_id: number;
}

export interface Subtopic {
  id: number;
  name: string;
  created_at: string;
}

export interface CreateMaterialDto {
  material_name: string;
  description?: string;
  message_link: string;
  subtopic_id: number;
}

export interface UpdateMaterialDto {
  material_name?: string;
  description?: string;
  message_link?: string;
  subtopic_id?: number;
}