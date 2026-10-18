'use client';

import { useEffect, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { safeToast as toast } from '@/lib/safeToast';
import { ensureDisplayableImage } from '@/lib/convertImage';

type Image = {
  id: string;
  url: string;
  file_path: string;
  rotation: number;
};

// Signed once for a month: the Media tab keeps the same urls for the whole session.
const SIGNED_URL_TTL = 60 * 60 * 24 * 30;

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
        // getSession reads the local cookie (getUser was a round trip to the auth server);
        // row security scopes the library to the family either way.
        const { data: sess } = await supabase.auth.getSession();

        if (!sess.session?.user) {
          if (active) setImages([]);
          return;
        }

        const { data, error } = await supabase
          .from('library_media')
          .select('id, file_path, rotation')
          .eq('file_type', 'image')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const rows = (data || []) as { id: string; file_path: string; rotation: number }[];

        // One signing call for the whole library, not one per photo.
        const urlByPath = new Map<string, string>();
        if (rows.length) {
          const { data: signed } = await supabase.storage
            .from('library-media')
            .createSignedUrls(rows.map((img) => img.file_path), SIGNED_URL_TTL);

          for (const s of signed || []) {
            if (s.path && s.signedUrl) urlByPath.set(s.path, s.signedUrl);
          }
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
        if (active) {
          setImages([]);
          toast.error('Could not load your photo library.');
        }
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
    const originalName = file.name;
    try {
      file = await ensureDisplayableImage(file);

      const { data: sess } = await supabase.auth.getSession();
      const user = sess.session?.user;

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

      if (insertError) {
        // No row, no reference to the file: take the upload back out of storage.
        await supabase.storage.from('library-media').remove([filePath]);
        throw insertError;
      }
      if (!media) throw new Error('Failed to create library media record');

      const { data: signed, error: signedError } = await supabase.storage
        .from('library-media')
        .createSignedUrl(media.file_path, SIGNED_URL_TTL);

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
      return newImage;
    } catch (error) {
      console.error('Failed to upload image:', error);
      toast.error(`Could not upload ${originalName}. Please try again.`);
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
      // The reply is checked: row security refuses with no error and no rows.
      const { data, error } = await supabase
        .from('library_media')
        .update({ rotation: newRotation })
        .eq('id', imageId)
        .select('id');

      if (error) throw error;
      if (!data || data.length === 0) throw new Error('Rotation was not saved');
    } catch (err) {
      console.error('Failed to rotate image:', err);
      toast.error('Could not rotate the photo. Please try again.');
      // Revert on failure
      setImages((prev) =>
        prev.map((img) =>
          img.id === imageId ? { ...img, rotation: current.rotation } : img
        )
      );
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
