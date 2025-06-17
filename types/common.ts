export interface OpenAIError {
  message?: string;
  type?: string;
  code?: string;
  status?: number;
  stack?: string;
}

export interface UpdateData {
  updated_at: string;
  photo_url?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
}