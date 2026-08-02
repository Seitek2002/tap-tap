export type Option = {
  label: string;
  value: string;
};

export type DropdownType = "checkbox" | "default" | "radio";

type BaseDropdownProps = {
  className?: string;
  hint?: string;
  label?: string;
  options: Option[];
  placeholder?: string;
  searchable?: boolean;
  type?: DropdownType;
};

// Обычный список (isMulti === false / не передан)
export type SingleDropdownProps = BaseDropdownProps & {
  isMulti?: false;
  onChange?: (value: string) => void;
  value?: string;
};

// Список с множественным выбором (isMulti === true)
export type MultiDropdownProps = BaseDropdownProps & {
  isMulti: true;
  onChange?: (value: string[]) => void;
  value?: string[];
};

export type DropdownProps = MultiDropdownProps | SingleDropdownProps;
