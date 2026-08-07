import { useState } from "react";

import { ChevronRight } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { Input } from "@/shared/ui/input";
import { Modal } from "@/shared/ui/modal";
import { Pill } from "@/shared/ui/pill";

import type { FieldType } from "../model/types";

type ConfigurableFieldProps = {
  onChange: (value: string) => void;
  options: string[];
  title: string;
  type: FieldType;
  value: string;
};

/**
 * Один вопрос анкеты, отрисованный тем виджетом, что настроен в
 * /admin/options (см. use-field-visibility.ts): пилюли прямо на экране,
 * шторка по кнопке, либо свободный текст. Видимость (вкл/выкл, кому)
 * решается ВЫШЕ, этот компонент только про то, КАК рисовать уже решённый
 * "показывать" вопрос — заворачивать его в useFieldVisibility().isVisible
 * здесь бессмысленно, страница и так не должна звать этот компонент, если
 * вопрос скрыт (нужно посчитать, не стал ли из-за этого весь экран пустым).
 */
export const ConfigurableField = ({
  onChange,
  options,
  title,
  type,
  value,
}: ConfigurableFieldProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (type === "text") {
    return (
      <Input
        label={title}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  if (type === "bottomsheet") {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex w-full items-center justify-between rounded-full border border-border-soft px-5 py-3.5 text-left"
        >
          <span className="text-sm font-medium">{title}</span>
          <span className="flex items-center gap-1 text-sm text-[#6B7280]">
            {value || "Указать"}
            <ChevronRight className="size-4" />
          </span>
        </button>

        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <h2 className="text-center text-lg font-bold">{title}</h2>
          <div className="mt-4 space-y-2">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full rounded-full px-4 py-3.5 text-center text-sm font-medium transition-colors",
                  value === option
                    ? "bg-primary text-white"
                    : "bg-[#F2F1F3] text-[#1C1E24]",
                )}
              >
                {option}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="mt-5 w-full rounded-full bg-[#1C1E24] py-3 text-sm font-semibold text-white"
          >
            Готово
          </button>
        </Modal>
      </>
    );
  }

  // "pill" — дефолт, пилюли прямо на экране (как и было раньше у всех этих
  // вопросов до появления этой настройки).
  return (
    <div>
      <h2 className="text-sm font-bold">{title}</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => (
          <Pill
            key={option}
            selected={value === option}
            onClick={() => onChange(option)}
          >
            {option}
          </Pill>
        ))}
      </div>
    </div>
  );
};
