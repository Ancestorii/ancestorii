'use client';

import { useEffect, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { ensureDisplayableImage } from '@/lib/convertImage';
import { safeToast as toast } from '@/lib/safeToast';

type Image = {
  id: string;
  url: string;
  file_path: string;
  rotation: number;
};

export default function Sidebar({
  onSelectImage,
  children,
}: {
  onSelectImage: (img: Image) => void;
  children: (props: {
    images: Image[];
    loading: boolean;
    handleUpload: (file: File) => Promise<Image | null>;
    handleRotateImage: (imageId: string) => Promise<void>;
    onSelectImage: (img: Image) => void;
  }) => React.ReactNode;
}) {
  const supabase = getBrowserClient();

  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        // The session is local (no network round trip); row security scopes the rows.
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          if (active) setImages([]);
          return;
        }

        const { data, error } = await supabase
          .from('library_media')
          .select('id, file_path, rotation')
          .eq('file_type', 'image')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // One signing call for the whole library (it used to be one round trip per photo).
        const rows = (data || []) as { id: string; file_path: string; rotation: number }[];
        const urlByPath = new Map<string, string>();
        if (rows.length > 0) {
          const paths = rows.map((img) => img.file_path);
          const { data: signed } = await supabase.storage
            .from('library-media')
            .createSignedUrls(paths, 60 * 60 * 24 * 30);
          (signed ?? []).forEach((item, i) => {
            if (item.signedUrl) urlByPath.set(item.path ?? paths[i], item.signedUrl);
          });
        }

        const withUrls = rows.map((img) => ({
          id: img.id,
          url: urlByPath.get(img.file_path) || '',
          file_path: img.file_path,
          rotation: img.rotation ?? 0,
        }));

        if (active) {
          setImages(withUrls.filter((img) => !!img.url));
        }
      } catch (error) {
        console.error('Failed to load library images:', error);
        if (active) setImages([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [supabase]);

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new window.Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
        URL.revokeObjectURL(url);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to read image dimensions'));
      };
      img.src = url;
    });
  };

  const handleUpload = async (file: File): Promise<Image | null> => {
    try {
      file = await ensureDisplayableImage(file);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) throw new Error('User not authenticated');

      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const safeName = file.name.replace(/\s+/g, '-').replace(/[^\w.-]/g, '');
      const filePath = `${user.id}/${Date.now()}-${safeName || `upload.${ext}`}`;

      const { error: uploadError } = await supabase.storage
        .from('library-media')
        .upload(filePath, file, {
          upsert: false,
          contentType: file.type || undefined,
        });

      if (uploadError) throw uploadError;

      const dimensions = await getImageDimensions(file);

      const { data: media, error: insertError } = await supabase
        .from('library_media')
        .insert({
          user_id: user.id,
          file_path: filePath,
          file_type: 'image',
          width: dimensions.width,
          height: dimensions.height,
          file_size_bytes: file.size,
        })
        .select('id, file_path, rotation')
        .single();

      if (insertError) throw insertError;
      if (!media) throw new Error('Failed to create library media record');

      const { data: signed, error: signedError } = await supabase.storage
        .from('library-media')
        .createSignedUrl(media.file_path, 60 * 60 * 24 * 30);

      if (signedError) throw signedError;

      const newImage: Image = {
        id: media.id,
        url: signed?.signedUrl || '',
        file_path: media.file_path,
        rotation: media.rotation ?? 0,
      };

      if (!newImage.url) {
        throw new Error('Failed to create signed URL');
      }

      setImages((prev) => [newImage, ...prev]);
      // The sidebar counts library photos; let it know.
      window.dispatchEvent(new Event('dashboard-data-changed'));
      return newImage;
    } catch (error) {
      console.error('Failed to upload image:', error);
      toast.error(`Could not upload ${file.name}.`);
      return null;
    }
  };

  const handleRotateImage = async (imageId: string): Promise<void> => {
    const current = images.find((img) => img.id === imageId);
    if (!current) return;

    const newRotation = current.rotation === 180 ? 0 : 180;

    // Optimistic local update: flip thumbnail immediately
    setImages((prev) =>
      prev.map((img) =>
        img.id === imageId ? { ...img, rotation: newRotation } : img
      )
    );

    try {
      const { data, error } = await supabase
        .from('library_media')
        .update({ rotation: newRotation })
        .eq('id', imageId)
        .select('id')
        .maybeSingle();

      if (error) throw error;
      // Row security blocks an update silently (no row comes back) rather than erroring.
      if (!data) throw new Error('Rotation not saved');
    } catch (err) {
      console.error('Failed to rotate image:', err);
      // Revert on failure
      setImages((prev) =>
        prev.map((img) =>
          img.id === imageId ? { ...img, rotation: current.rotation } : img
        )
      );
      toast.error('Could not rotate that photo.');
    }
  };

  return (
    <>
      {children({
        images,
        loading,
        handleUpload,
        handleRotateImage,
        onSelectImage,
      })}
    </>
  );
}