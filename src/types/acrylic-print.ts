export type AcrylicAsset = {
  id?: string;
  asset_id?: string;
  url?: string;
  slot_index: number;
  caption?: string | null;
  crop_data?: Record<string, any>;
  rotation?: number;
};

export type SelectedImage = {
  id: string;
  file_path: string;
};

export type LayoutType = 'solo' | 'duo' | 'grid';

export type TierKey = 'portrait' | 'centrepiece' | 'masterpiece';

export type AcrylicSize = '16x24' | '24x24' | '24x36';

export type Orientation = 'landscape' | 'portrait' | 'square';

export type AcrylicStatus = 'draft' | 'completed' | 'ordered';