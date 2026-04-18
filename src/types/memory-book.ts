export type Asset = {
  id?: string;
  asset_id?: string;
  url?: string;
  slot_index: number;
  subheading?: string | null;
  comment?: string | null;
};

export type SelectedImage = {
  id: string;
  file_path: string;
};

export type LayoutType =
  | 'portrait_layout'
  | 'landscape_layout'
  | 'duo_layout'
  | 'grid_layout'
  | 'feature_layout';

export type CoverLayoutType =
  | 'classic_cover'
  | 'full_bleed_cover'
  | 'trio_cover';

export type BackCoverLayoutType =
  | 'blank_back'
  | 'dedication_back'
  | 'photo_message_back';

export type Page = {
  id: string;
  layout_type: LayoutType;
  page_number: number;
  show_subheading: boolean;
  show_comment: boolean;
  assets: Asset[];
};

export type BookSize = 'a4_landscape';

export type CoverDesign = {
  layout: CoverLayoutType;
  assets: Asset[];
};

export type BackCoverDesign = {
  layout: BackCoverLayoutType;
  assets: Asset[];
};

export type SpineDesign = {
  text: string;
  text_color: string;
  background_color: string;
};