import { ChevronDown, X } from "lucide-react";

import { cn } from "@/shared/lib/utils";

import type { Option } from "./types";

type TriggerProps = {
  isActive: boolean;
  isMulti: boolean;
  onRemove: (val: string) => void;
  onToggle: () => void;
  options: Option[];
  placeholder: string;
  value?: string | string[];
};

export const DropdownTrigger = ({
  isActive,
  isMulti,
  onRemove,
  onToggle,
  options,
  placeholder,
  value,
}: TriggerProps) => {
  return (
    <div
      onClick={onToggle}
      className={cn(
        "flex min-h-10.5 cursor-pointer select-none items-center justify-between rounded-full border bg-white px-4 py-3.5 font-medium transition-all duration-200",
        "border-border-soft",
        isActive
          ? "border-primary shadow-[0_0_1px_3px_rgba(124,58,237,0.3)]"
          : "hover:border-primary/50",
      )}
    >
      <div className="flex flex-1 flex-wrap gap-1.5 overflow-hidden">
        {isMulti && Array.isArray(value) && value.length > 0 ? (
          value.map((val) => (
            <div
              key={val}
              className="flex items-center gap-1 rounded-md border border-border-soft bg-white px-2 py-0.5 text-sm"
            >
              {options.find((o) => o.value === val)?.label}
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onRemove(val);
                }}
                className="transition-colors hover:text-primary"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))
        ) : (
          <span className={cn(value ? "text-foreground" : "text-muted")}>
            {options.find((o) => o.value === (value as string))?.label ||
              placeholder}
          </span>
        )}
      </div>
      <ChevronDown
        className={cn(
          "size-5 text-muted transition-transform duration-300",
          isActive && "rotate-180",
        )}
      />
    </div>
  );
};
