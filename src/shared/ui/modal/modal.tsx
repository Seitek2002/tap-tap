import { X } from "lucide-react";
import {
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { useKeyboardInset } from "@/shared/lib/use-keyboard-inset";
import { useMounted } from "@/shared/lib/use-mounted";
import { useScrollLock } from "@/shared/lib/use-scroll-lock";

type ModalProps = {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
};

const DURATION = 200;
// Ниже этого сдвига по Y (px) отпускание пальца закрывает шторку, а не
// возвращает её на место.
const SWIPE_DISMISS_THRESHOLD = 120;

export const Modal = ({ children, isOpen, onClose, title }: ModalProps) => {
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const mounted = useMounted();

  // Реагируем на переход isOpen → false сам по себе, а не на конкретный клик
  // по оверлею/Escape — так анимация закрытия срабатывает независимо от
  // того, что вызвало закрытие: сам Modal или любая кнопка внутри children.
  // setState прямо в теле рендера — официальный паттерн React для подстройки
  // state под изменившийся проп (в отличие от синхронного setState в effect).
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setIsRendered(true);
      setIsClosing(false);
    } else {
      setIsClosing(true);
    }
  }

  // Таймер закрытия — легитимный эффект (подписка на внешний таймер),
  // setState внутри его колбэка не подпадает под запрет.
  useEffect(() => {
    if (!isClosing) return;
    const timer = setTimeout(() => {
      setIsClosing(false);
      setIsRendered(false);
    }, DURATION);
    return () => clearTimeout(timer);
  }, [isClosing]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useScrollLock(isRendered);
  const keyboardInset = useKeyboardInset();

  // Свайп-вниз для закрытия боттомшита: тянуть можно только за хендл-бар
  // сверху (не за весь шит), чтобы не конфликтовать со скроллом контента
  // внутри. Пока идёт драг — двигаем шит инлайн-стилем напрямую под пальцем
  // (transition: none), а по отпусканию либо чистим инлайн-стиль (тогда
  // возврат на место анимирует уже CSS-переход modal-sheet), либо зовём
  // onClose() — и в закрытое положение шит уезжает тем же CSS-переходом.
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartYRef = useRef(0);

  const handleDragStart = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragStartYRef.current = event.clientY;
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleDragMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setDragY(Math.max(0, event.clientY - dragStartYRef.current));
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragY > SWIPE_DISMISS_THRESHOLD) onClose();
    setDragY(0);
  };

  if (!mounted || !isRendered) return null;

  const state = isClosing ? "closed" : "open";

  return createPortal(
    <div
      className="fixed inset-0 z-100 flex items-end justify-center sm:items-center"
      style={{ paddingBottom: keyboardInset }}
    >
      <div
        className="modal-overlay absolute inset-0 bg-black/40 backdrop-blur-sm"
        data-state={state}
        onClick={onClose}
      />

      {/* Мобильный bottom-sheet */}
      <div
        className="modal-sheet relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-xl sm:hidden"
        data-state={state}
        style={
          isDragging
            ? { transform: `translateY(${dragY}px)`, transition: "none" }
            : undefined
        }
      >
        <div
          onPointerDown={handleDragStart}
          onPointerMove={handleDragMove}
          onPointerUp={handleDragEnd}
          onPointerCancel={handleDragEnd}
          className="flex shrink-0 touch-none justify-center pt-1.5"
        >
          <div className="h-0.5 w-10 rounded-full bg-[#6B7280]" />
        </div>
        {title && (
          <div className="flex items-center justify-between border-b border-border-soft p-5">
            <h2 className="text-xl font-semibold text-foreground">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-muted transition-colors hover:bg-gray-100"
            >
              <X className="size-5" />
            </button>
          </div>
        )}
        <div className="overflow-y-auto p-4">{children}</div>
      </div>

      {/* Десктоп по центру */}
      <div
        className="modal-panel relative hidden max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-xl sm:flex"
        data-state={state}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-border-soft p-5">
            <h2 className="text-xl font-semibold text-foreground">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-muted transition-colors hover:bg-gray-100"
            >
              <X className="size-5" />
            </button>
          </div>
        )}
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
};
