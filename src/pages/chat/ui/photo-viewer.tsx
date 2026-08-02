import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  type PointerEvent as ReactPointerEvent,
  type TouchEvent as ReactTouchEvent,
  type WheelEvent as ReactWheelEvent,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { useMounted } from "@/shared/lib/use-mounted";
import { useScrollLock } from "@/shared/lib/use-scroll-lock";

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const DOUBLE_TAP_SCALE = 2.5;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const getTouchDistance = (
  a: { clientX: number; clientY: number },
  b: { clientX: number; clientY: number },
) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);

type PhotoViewerProps = {
  imageUrl: null | string;
  onClose: () => void;
};

export const PhotoViewer = ({ imageUrl, onClose }: PhotoViewerProps) => {
  const mounted = useMounted();
  useScrollLock(imageUrl !== null);

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const pinchRef = useRef<{ distance: number; scale: number } | null>(null);
  const panRef = useRef<{
    originX: number;
    originY: number;
    startX: number;
    startY: number;
  } | null>(null);

  // Сброс зума при каждом открытии/закрытии — подстройка state под
  // изменившийся проп прямо в рендере, как в Modal.
  const [prevImageUrl, setPrevImageUrl] = useState(imageUrl);
  if (imageUrl !== prevImageUrl) {
    setPrevImageUrl(imageUrl);
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }

  const resetZoom = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const handleDoubleClick = () => {
    if (scale > MIN_SCALE) {
      resetZoom();
    } else {
      setScale(DOUBLE_TAP_SCALE);
    }
  };

  const handleWheel = (event: ReactWheelEvent) => {
    event.preventDefault();
    const next = clamp(scale - event.deltaY * 0.01, MIN_SCALE, MAX_SCALE);
    setScale(next);
    if (next === MIN_SCALE) setOffset({ x: 0, y: 0 });
  };

  const handleTouchStart = (event: ReactTouchEvent) => {
    if (event.touches.length === 2) {
      pinchRef.current = {
        distance: getTouchDistance(event.touches[0], event.touches[1]),
        scale,
      };
    }
  };

  const handleTouchMove = (event: ReactTouchEvent) => {
    if (event.touches.length === 2 && pinchRef.current) {
      const distance = getTouchDistance(event.touches[0], event.touches[1]);
      setScale(
        clamp(
          pinchRef.current.scale * (distance / pinchRef.current.distance),
          MIN_SCALE,
          MAX_SCALE,
        ),
      );
    }
  };

  const handleTouchEnd = (event: ReactTouchEvent) => {
    if (event.touches.length < 2) pinchRef.current = null;
    if (scale <= MIN_SCALE) setOffset({ x: 0, y: 0 });
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLImageElement>) => {
    if (scale <= MIN_SCALE) return;
    setIsDragging(true);
    panRef.current = {
      originX: offset.x,
      originY: offset.y,
      startX: event.clientX,
      startY: event.clientY,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent) => {
    if (!panRef.current) return;
    setOffset({
      x: panRef.current.originX + (event.clientX - panRef.current.startX),
      y: panRef.current.originY + (event.clientY - panRef.current.startY),
    });
  };

  const handlePointerUp = () => {
    panRef.current = null;
    setIsDragging(false);
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {imageUrl && (
        <motion.div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/90"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="absolute top-4 right-4 z-10 flex size-10 items-center justify-center rounded-full bg-white/10 text-white"
          >
            <X className="size-5" />
          </button>
          <img
            src={imageUrl}
            alt=""
            onClick={(event) => event.stopPropagation()}
            onDoubleClick={handleDoubleClick}
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{
              touchAction: "none",
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
              transition: isDragging ? "none" : "transform 150ms ease-out",
            }}
            className="max-h-full max-w-full object-contain select-none"
          />
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
