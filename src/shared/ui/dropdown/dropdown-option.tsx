import { Check } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { Checkbox, Radio } from "@/shared/ui/input";

import type { DropdownType, Option } from "./types";

type OptionProps = {
  isSelected: boolean;
  onClick: () => void;
  option: Option;
  type: DropdownType;
};

export const DropdownOption = ({
  isSelected,
  onClick,
  option,
  type,
}: OptionProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex cursor-pointer items-center justify-between p-4 transition-colors md:px-3 md:py-2.5",
        "border-b border-border-soft last:border-b-0 md:border-none",
        isSelected && type === "default"
          ? "md:bg-background"
          : "md:hover:bg-background",
      )}
    >
      <span className="flex-1 text-base text-foreground md:text-sm">
        {option.label}
      </span>

      {type === "checkbox" && (
        <div className="pointer-events-none">
          <Checkbox checked={isSelected} readOnly />
        </div>
      )}

      {type === "radio" && (
        <div className="pointer-events-none">
          <Radio checked={isSelected} readOnly />
        </div>
      )}

      {type === "default" && isSelected && (
        <Check className="size-5 text-primary md:size-3.5 md:text-foreground" />
      )}
    </div>
  );
};
