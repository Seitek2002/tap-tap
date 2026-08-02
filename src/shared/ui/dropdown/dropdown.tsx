import { useEffect, useMemo, useRef, useState } from "react";

import { useClickAway } from "@/shared/lib/use-click-away";
import { cn } from "@/shared/lib/utils";
import { Checkbox } from "@/shared/ui/input";

import { DropdownMenu } from "./dropdown-menu";
import { DropdownOption } from "./dropdown-option";
import { DropdownTrigger } from "./dropdown-trigger";
import type { DropdownProps } from "./types";

export const Dropdown = ({
  className,
  hint,
  isMulti = false,
  label,
  onChange,
  options,
  placeholder = "Выберите...",
  searchable = false,
  type = "default",
  value,
}: DropdownProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const openDropdown = () => {
    setIsMounted(true);
    setTimeout(() => setIsActive(true), 10);
  };

  const closeDropdown = () => {
    setIsActive(false);
    setTimeout(() => {
      setIsMounted(false);
      setSearchQuery("");
    }, 300);
  };

  useClickAway(containerRef, () => {
    if (isMounted && isActive) closeDropdown();
  });

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMounted && isMobile) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMounted]);

  const handleSelect = (val: string) => {
    if (isMulti) {
      const current = Array.isArray(value) ? value : [];
      const newValues = current.includes(val)
        ? current.filter((v) => v !== val)
        : [...current, val];

      (onChange as (val: string[]) => void)?.(newValues);
    } else {
      (onChange as (val: string) => void)?.(val);

      // одиночный выбор — закрываем сразу (и дропдаун, и мобильный bottom-sheet)
      closeDropdown();
    }
  };

  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [options, searchQuery]);

  return (
    <div className={cn("flex w-full flex-col gap-1.5", className)} ref={containerRef}>
      {label && <span className="text-sm font-medium text-overlay">{label}</span>}

      <div className="relative">
        <DropdownTrigger
          isActive={isActive}
          isMulti={isMulti}
          options={options}
          placeholder={placeholder}
          value={value}
          onRemove={handleSelect}
          onToggle={() => (isActive ? closeDropdown() : openDropdown())}
        />

        {isMounted && (
          <div
            className={cn(
              "fixed inset-0 z-40 bg-overlay/40 backdrop-blur-[2px] transition-opacity duration-300 ease-out md:hidden",
              isActive ? "opacity-100" : "opacity-0",
            )}
            onClick={closeDropdown}
          />
        )}

        {isMounted && (
          <DropdownMenu
            isActive={isActive}
            label={label}
            placeholder={placeholder}
            searchable={searchable}
            searchQuery={searchQuery}
            onClose={closeDropdown}
            onSearchChange={setSearchQuery}
          >
            {isMulti && !searchQuery && (
              <>
                <div
                  className="flex cursor-pointer items-center justify-between border-b border-border-soft p-4 transition-colors md:border-none md:px-3 md:py-2.5 md:hover:bg-background"
                  onClick={() =>
                    (onChange as (val: string[]) => void)?.(
                      Array.isArray(value) && value.length === options.length
                        ? []
                        : options.map((o) => o.value),
                    )
                  }
                >
                  <span className="flex-1 text-base text-foreground md:text-sm">
                    Все
                  </span>
                  <div className="pointer-events-none">
                    <Checkbox
                      checked={
                        Array.isArray(value) && value.length === options.length
                      }
                      readOnly
                    />
                  </div>
                </div>
                <div className="mx-3 my-1 hidden h-px bg-background md:block" />
              </>
            )}

            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <DropdownOption
                  key={opt.value}
                  isSelected={
                    Array.isArray(value)
                      ? value.includes(opt.value)
                      : value === opt.value
                  }
                  option={opt}
                  type={type}
                  onClick={() => handleSelect(opt.value)}
                />
              ))
            ) : (
              <div className="p-6 text-center text-sm text-muted">
                Ничего не найдено
              </div>
            )}
          </DropdownMenu>
        )}
      </div>

      {hint && <span className="ml-1 text-sm text-muted">{hint}</span>}
    </div>
  );
};
