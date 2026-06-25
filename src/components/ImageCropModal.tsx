'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { getCroppedImg } from '@/lib/cropImage';
import { X, ZoomIn, ZoomOut } from 'lucide-react';

type Props = {
  imageSrc: string;
  onConfirm: (croppedFile: File) => void;
  onCancel: () => void;
};

export default function ImageCropModal({ imageSrc, onConfirm, onCancel }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setProcessing(true);
    try {
      const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels);
      onConfirm(croppedFile);
    } catch (err) {
      console.error('Crop failed:', err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-[#16120C]/80" onClick={onCancel} />

      {/* Modal */}
      <div className="relative z-10 w-[92vw] max-w-[480px] rounded-[16px] bg-[#FFFDF9] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EDE8DF]">
          <h3 className="text-[15px] font-semibold text-[#1A1612]">Adjust Profile Photo</h3>
          <button
            onClick={onCancel}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#F5F0E8] transition"
          >
            <X size={16} strokeWidth={2} className="text-[#6F6255]" />
          </button>
        </div>

        {/* Crop area */}
        <div className="relative h-[340px] bg-[#1A1612]">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            minZoom={1}
            maxZoom={3}
          />
        </div>

        {/* Zoom control */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-[#EDE8DF]">
          <ZoomOut size={15} strokeWidth={2} className="text-[#9B8E7D] shrink-0" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 h-[4px] appearance-none rounded-full bg-[#EDE8DF] accent-[#C8A557] cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#C8A557] [&::-webkit-slider-thumb]:shadow-[0_1px_4px_rgba(0,0,0,0.15)] [&::-webkit-slider-thumb]:cursor-pointer
              [&::-moz-range-thumb]:h-[18px] [&::-moz-range-thumb]:w-[18px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#C8A557] [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-[0_1px_4px_rgba(0,0,0,0.15)] [&::-moz-range-thumb]:cursor-pointer"
          />
          <ZoomIn size={15} strokeWidth={2} className="text-[#9B8E7D] shrink-0" />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-[#EDE8DF]">
          <button
            onClick={onCancel}
            className="h-[40px] px-5 rounded-[10px] border border-[#DCC7A4] text-[13px] font-semibold text-[#6F6255] transition hover:bg-[#F5F0E8]"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={processing}
            className="flex h-[40px] items-center justify-center gap-2 px-6 rounded-[10px] bg-[#C8A557] text-[13px] font-semibold text-white shadow-[0_4px_14px_rgba(184,146,74,0.2)] transition hover:bg-[#B8924A] disabled:opacity-50"
          >
            {processing ? (
              <>
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Cropping…
              </>
            ) : (
              'Confirm'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}