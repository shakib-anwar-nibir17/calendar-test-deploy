"use client";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StandaloneSelectProps<T> {
  readonly id?: string;
  readonly label?: string;
  readonly placeholder?: string;
  readonly helperText?: string;
  readonly options: T[];
  readonly getOptionLabel: (option: T) => string;
  readonly getOptionValue: (option: T) => string | number;
  readonly value?: string;
  readonly onChange?: (value: string) => void;
  readonly className?: string;
  readonly disabled?: boolean;
  readonly required?: boolean;
  readonly error?: string;
}

export function SelectMenu<T>({
  id,
  label,
  placeholder = "Select an option",
  helperText,
  options,
  getOptionLabel,
  getOptionValue,
  value,
  onChange,
  className,
  disabled = false,
  required = false,
  error,
}: StandaloneSelectProps<T>) {
  return (
    <div className={cn("space-y-2 w-[300px]", className)}>
      {label && (
        <Label htmlFor={id} className="flex items-center gap-1">
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id={id} className={cn(error && "border-destructive")}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option, index) => (
            <SelectItem
              key={`${getOptionValue(option)}-${index}`}
              value={String(getOptionValue(option))}
            >
              {getOptionLabel(option)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {helperText && (
        <p className="text-sm text-muted-foreground">{helperText}</p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
