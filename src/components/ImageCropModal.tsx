'use client';

import { useState, useCallback, useId } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { getCroppedImg } from '@/lib/cropImage';
import { X, ZoomIn, ZoomOut } from 'lucide-react';
import { ui, appRoot, Btn, IconBtn, Spinner, useDialog } from '@/components/dashboard/ui/AppBits';
import s from './ImageCropModal.module.css';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

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
  const titleId = useId();

  // Mounted only while open: Escape cancels (as the close button does), Tab stays inside, and
  // focus goes back to the photo picker when it closes.
  const panelRef = useDialog<HTMLDivElement>(true, onCancel);

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
    // appRoot: the kit's tokens and font wherever the modal is used.
    <div className={cx(appRoot, s.root)}>
      {/* Overlay: a sibling of the panel, so a drag that starts on the photo and ends outside
          the panel never counts as a click on it */}
      <div className={cx(ui.scrim, ui.fadeIn, 'scrim-blur')} onClick={onCancel} aria-hidden="true" />

      {/* Modal */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cx(ui.sheet, ui.sheetBottom, ui.popIn, s.panel)}
      >
        {/* Header */}
        <div className={ui.sheetHeader}>
          <h2 id={titleId} className={cx(ui.sheetTitle, 'self-center')}>
            Adjust Profile Photo
          </h2>
          <IconBtn label="Close" onClick={onCancel}>
            <X size={20} strokeWidth={2.4} aria-hidden="true" />
          </IconBtn>
        </div>

        <div className={ui.sheetBody}>
          {/* Crop area */}
          <div className={s.stage}>
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
              classes={{ cropAreaClassName: s.cropArea }}
              style={{ cropAreaStyle: { border: '2px solid rgba(255, 255, 255, 0.9)', color: 'rgba(10, 10, 15, 0.55)' } }}
            />
          </div>

          {/* Zoom control */}
          <div className={s.zoomRow}>
            <ZoomOut size={18} strokeWidth={2.4} aria-hidden="true" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              aria-label="Zoom"
              className={s.zoom}
            />
            <ZoomIn size={18} strokeWidth={2.4} aria-hidden="true" />
          </div>
        </div>

        {/* Actions */}
        <div className={ui.sheetFooter}>
          <Btn variant="soft" onClick={onCancel}>
            Cancel
          </Btn>
          <Btn
            onClick={handleConfirm}
            disabled={processing}
            icon={processing ? <Spinner size={16} /> : undefined}
          >
            {processing ? 'Cropping…' : 'Confirm'}
          </Btn>
        </div>
      </div>
    </div>
  );
}
