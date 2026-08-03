import { type ReactNode } from "react";

import { X } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

import { useDropdownSwipe } from "./use-dropdown-swipe";

type MenuProps = {
  children: ReactNode;
  isActive: boolean;
  label?: string;
  onClose: () => void;
  onSearchChange: (val: string) => void;
  placeholder: string;
  searchable: boolean;
  searchQuery: string;
};

export const DropdownMenu = ({
  children,
  isActive,
  label,
  onClose,
  onSearchChange,
  placeholder,
  searchable,
  searchQuery,
}: MenuProps) => {
  const { handlers, scrollRef, sheetRef } = useDropdownSwipe(onClose);

  return (
    <div
      ref={sheetRef}
      {...handlers}
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-3xl bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]",
        "transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
        "md:absolute md:inset-auto md:top-full md:mt-1 md:w-full md:rounded-xl md:border md:border-border-soft md:p-1 md:shadow-[0_4px_20px_rgba(0,0,0,0.08)] md:ease-out",
        isActive
          ? "translate-y-0 opacity-100 md:scale-100"
          : "translate-y-full opacity-0 md:-translate-y-2 md:scale-95",
      )}
    >
      <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-border-soft md:hidden" />

      <div className="mb-4 flex items-center justify-between md:hidden">
        <div className="size-8" />
        <span className="text-lg font-semibold text-overlay">
          {label || placeholder}
        </span>
        <button
          onClick={onClose}
          className="flex size-8 items-center justify-center rounded-full border border-border-soft bg-background/50 text-foreground transition-colors active:bg-border-soft"
        >
          <X className="size-3.5" />
        </button>
      </div>

      {searchable && (
        <div className="sticky top-0 z-10 mb-4 bg-white md:mb-0 md:border-b md:border-border-soft/50 md:p-2">
          <input
            type="text"
            placeholder="Поиск..."
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            onClick={(event) => event.stopPropagation()}
            className="w-full rounded-xl border border-border-soft px-3 py-2.5 text-base text-foreground outline-none transition-all focus:border-primary focus:shadow-[0_0_1px_3px_rgba(124,58,237,0.1)] md:rounded-md md:py-1.5 md:text-sm"
          />
        </div>
      )}

      <div
        ref={scrollRef}
        className="max-h-[55vh] flex-1 overflow-y-auto rounded-xl border border-border-soft md:max-h-64 md:rounded-none md:border-none"
      >
        {children}
      </div>

      <div className="mt-5 md:hidden">
        <Button
          className="w-full justify-center py-3.5 text-base"
          onClick={onClose}
        >
          Готово
        </Button>
      </div>
    </div>
  );
};
