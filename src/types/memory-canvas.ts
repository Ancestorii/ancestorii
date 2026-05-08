export type CanvasAsset = {
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

export type LayoutType =
  | 'solo'
  | 'triptych'
  | 'highlight'
  | 'filmstrip'
  | 'storyboard'
  | 'stack'
  | 'hero_2'
  | 'cascade'
  | 'journal'
  | 'duo'
  | 'grid'
  | 'feature'
  | 'mosaic'
  | 'timeline'
  | 'gallery'
  | 'centrepiece'
  | 'tower'
  | 'generations';

export type TierKey = 'moment' | 'heirloom' | 'heritage';

export type CanvasSize = '16x36' | '20x32' | '24x72';

export type Orientation = 'landscape' | 'portrait';

export type WrapType = 'imagewrap' | 'mirrorwrap' | 'black' | 'white';

export type CanvasStatus = 'draft' | 'completed' | 'ordered';