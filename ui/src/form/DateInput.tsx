import { useRef, useState, type ComponentProps } from "react";
import { BiCalendar } from "react-icons/bi";
import z from "zod";
import { Calendar } from "../display/Calendar";
import { FormattedDate } from "../display/FormattedDate";
import { Popover } from "../overlay/Popover";
import { Field, FieldProps } from "./Field";
import { InputWrapper } from "./InputWrapper";
import { BaseInputProps } from "./use-form";

export type DateInputProps = Omit<
  ComponentProps<"input">,
  "size" | "value" | "defaultValue"
> &
  BaseInputProps<Date> & {
    size?: "s" | "m" | "l";
    variant?: "default" | "unstyled";
    closeOnSelect?: boolean;
    fieldProps?: Partial<FieldProps>;
  };

export function DateInput({
  size = "m",
  variant = "default",
  closeOnSelect,
  label,
  description,
  error,
  required,
  touched,
  onTouch,
  disabled,
  fieldProps,
  value,
  onChangeValue,
  ...props
}: DateInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [displayValue, setDisplayValue] = useState(
    value ? FormattedDate.format(value) : "",
  );

  const close = () => {
    if (closeOnSelect) setOpen(false);
  };

  const onOpenChange = (nextOpen: boolean) => {
    if (nextOpen && disabled) return;
    setOpen(nextOpen);
    if (!nextOpen) onTouch?.();
  };

  return (
    <Field
      htmlFor={props.id}
      {...{ label, description, error, required }}
      {...fieldProps}
    >
      <Popover
        align="center"
        content={
          <Calendar
            mode="single"
            defaultMonth={value ?? new Date()}
            selected={value}
            onSelect={(date) => {
              if (date) {
                onChangeValue?.(date);
                setDisplayValue(FormattedDate.format(date));
                close();
              }
            }}
          />
        }
        open={open}
        onOpenChange={onOpenChange}
        sideOffset={0.5}
      >
        <InputWrapper
          active={open}
          size={size}
          variant={variant}
          disabled={disabled}
          right={<BiCalendar />}
        >
          <input
            {...props}
            ref={inputRef}
            type="text"
            disabled={disabled}
            required={required}
            value={displayValue}
            onChange={(e) => {
              const nextValue = e.currentTarget.value;
              setDisplayValue(nextValue);
              const date = DateInput.parse(nextValue);
              if (date) onChangeValue?.(date);
            }}
            data-touched={touched || undefined}
            autoComplete="off"
            aria-expanded={open}
            aria-haspopup="dialog"
          />
        </InputWrapper>
      </Popover>
    </Field>
  );
}

DateInput.parse = function parseDate(value: string): Date | null {
  const result = z.coerce.date().safeParse(value);
  if (!result.success) return null;
  return result.data;
};
