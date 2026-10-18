export type Asset = {
  id?: string;
  asset_id?: string;
  url?: string;
  slot_index: number;
  subheading?: string | null;
  comment?: string | null;
  rotation?: number;
};

export type SelectedImage = {
  id: string;
  file_path: string;
  rotation?: number;
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

// Rows as the editor and export pages select them: memory_book_pages with their assets and each
// asset's library file.
export type BookPageAssetRow = {
  id: string;
  asset_id: string;
  slot_index: number;
  subheading: string | null;
  comment: string | null;
  library_media: { file_path: string; rotation: number | null } | null;
};

export type BookPageRow = {
  id: string;
  page_number: number;
  layout_type: LayoutType;
  show_subheading: boolean;
  show_comment: boolean;
  memory_book_page_assets: BookPageAssetRow[] | null;
};

// memory_books.cover_design and back_cover_design as stored (jsonb, so nothing is promised).
export type CoverDesignJson = { layout?: unknown; assets?: unknown };

// The cover, back cover and spine as the editor page loads them (assets carry signed urls).
export type BookCoverState = {
  coverLayout: CoverLayoutType;
  backCoverLayout: BackCoverLayoutType;
  coverAssets: Asset[];
  backCoverAssets: Asset[];
  spineText: string;
  spineBgColour: string;
  spineTextColour: string;
};