'use client';

import { useEffect, useState } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import { ensureDisplayableImage } from '@/lib/convertImage';

type Image = {
  id: string;
  url: string;
  file_path: string; // ✅ ADD THIS
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
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          if (active) setImages([]);
          return;
        }

        const { data, error } = await supabase
          .from('library_media')
          .select('id, file_path')
          .eq('user_id', user.id)
          .eq('file_type', 'image')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const withUrls = await Promise.all(
          (data || []).map(async (img: { id: string; file_path: string }) => {
            const { data: signed } = await supabase.storage
              .from('library-media')
              .createSignedUrl(img.file_path, 60 * 60 * 24 * 30);

            return {
           id: img.id,
           url: signed?.signedUrl || '',
           file_path: img.file_path, // 🔥 ADD THIS
           };
          })
        );

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
        data: { user },
      } = await supabase.auth.getUser();

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
        .select('id, file_path')
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
      file_path: media.file_path, // 🔥 THIS IS THE MISSING LINK
      };

      if (!newImage.url) {
        throw new Error('Failed to create signed URL');
      }

      setImages((prev) => [newImage, ...prev]);
      return newImage;
    } catch (error) {
      console.error('Failed to upload image:', error);
      return null;
    }
  };

  return (
    <>
      {children({
        images,
        loading,
        handleUpload,
        onSelectImage,
      })}
    </>
  );
}