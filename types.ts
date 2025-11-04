export enum AppMode {
  GENERATE = 'generate',
  EDIT = 'edit',
  FLUX_EDIT = 'flux-edit',
}

export interface SavedPrompt {
  id: string;
  text: string;
}

export interface GeneratedImageHistoryItem {
  id: string;
  imageUrls: string[];
  prompt: string;
  type: 'generate' | 'edit' | 'flux-edit';
  modelId: string | null;
  style?: string;
  aspectRatio?: string;
}

export interface TrainedModel {
  id: string;
  name: string;
  description?: string;
  status: 'training' | 'ready' | 'failed';
  previewImages: string[];
}