import { X } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { useMounted } from "@/shared/lib/use-mounted";
import { useScrollLock } from "@/shared/lib/use-scroll-lock";

type ModalProps = {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
};

const DURATION = 200;

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

  if (!mounted || !isRendered) return null;

  const state = isClosing ? "closed" : "open";

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-end justify-center sm:items-center">
      <div
        className="modal-overlay absolute inset-0 bg-black/40 backdrop-blur-sm"
        data-state={state}
        onClick={onClose}
      />

      {/* Мобильный bottom-sheet */}
      <div
        className="modal-sheet relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-xl sm:hidden"
        data-state={state}
      >
        <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-[#E4E7EC]" />
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
