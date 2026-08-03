import {
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  useRef,
  useState,
} from "react";

import { RefreshCw } from "lucide-react";

import { ImpactStyle, triggerHaptic } from "@/shared/lib/haptics";
import { cn } from "@/shared/lib/utils";

type PullToRefreshProps = {
  children: ReactNode;
  className?: string;
  onRefresh: () => Promise<void> | void;
};

// Тянуть можно только начиная от самого верха списка (scrollTop === 0) —
// иначе жест конфликтовал бы с обычным скроллом контента.
const PULL_THRESHOLD = 64;
const MAX_PULL = 96;
const INDICATOR_SIZE = 40;

/** Потянуть вниз от начала списка — запустить onRefresh со спиннером. */
export const PullToRefresh = ({
  children,
  className,
  onRefresh,
}: PullToRefreshProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<null | number>(null);
  const [pullY, setPullY] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (isRefreshing) return;
    if ((containerRef.current?.scrollTop ?? 0) > 0) return;
    startYRef.current = event.clientY;
    setIsPulling(true);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (startYRef.current === null) return;
    const delta = event.clientY - startYRef.current;
    if (delta <= 0 || (containerRef.current?.scrollTop ?? 0) > 0) {
      startYRef.current = null;
      setIsPulling(false);
      setPullY(0);
      return;
    }
    setPullY(Math.min(delta * 0.5, MAX_PULL));
  };

  const finishPull = async () => {
    if (startYRef.current === null) return;
    startYRef.current = null;
    setIsPulling(false);

    if (pullY > PULL_THRESHOLD) {
      triggerHaptic(ImpactStyle.Medium);
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
    setPullY(0);
  };

  const indicatorProgress = Math.min(pullY / PULL_THRESHOLD, 1);
  const offset = isRefreshing ? INDICATOR_SIZE : pullY;

  return (
    <div
      ref={containerRef}
      onPointerCancel={finishPull}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishPull}
      className={cn(
        "relative overflow-x-hidden overscroll-y-contain",
        className,
      )}
      style={{
        transform: offset > 0 ? `translateY(${offset}px)` : undefined,
        transition: isPulling ? "none" : "transform 200ms ease",
      }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 flex items-center justify-center"
        style={{ height: INDICATOR_SIZE, top: -INDICATOR_SIZE }}
      >
        <RefreshCw
          className={cn(
            "size-5 text-[#6B7280]",
            isRefreshing && "animate-spin",
          )}
          style={{
            opacity: isRefreshing ? 1 : indicatorProgress,
            transform: isRefreshing
              ? undefined
              : `rotate(${indicatorProgress * 360}deg)`,
          }}
        />
      </div>
      {children}
    </div>
  );
};
