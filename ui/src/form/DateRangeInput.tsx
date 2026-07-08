import "@daypicker/react/dist/style.css";
import { DateRange } from "@isis/common/dto/date-range";
import { useRef, useState, type ComponentProps } from "react";
import { BiCalendar } from "react-icons/bi";
import z from "zod";
import { Calendar } from "../display/Calendar";
import { FormattedDateRange } from "../display/FormattedDateRange";
import { Popover } from "../overlay/Popover";
import { Field, FieldProps } from "./Field";
import { InputWrapper } from "./InputWrapper";
import { BaseInputProps } from "./use-form";

export type DateRangeInputProps = Omit<
  ComponentProps<"input">,
  "size" | "value" | "defaultValue"
> &
  BaseInputProps<DateRange> & {
    size?: "s" | "m" | "l";
    variant?: "default" | "unstyled";
    closeOnSelect?: boolean;
    fieldProps?: FieldProps;
  };

export function DateRangeInput({
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
}: DateRangeInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [displayValue, setDisplayValue] = useState(
    value && FormattedDateRange.format(value),
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
            mode="range"
            defaultMonth={value?.from ?? value?.to ?? new Date()}
            selected={{
              from: value?.from,
              to: value?.to,
            }}
            onSelect={(range) => {
              if (range) {
                onChangeValue?.(range);
                setDisplayValue(FormattedDateRange.format(range));
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
              const range = parseDateRange(nextValue);
              if (range) onChangeValue?.(range);
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

function parseDateRange(range: string): DateRange | null {
  const [fromValue, toValue] = range.split(/\s+[-—]\s+/, 2);
  const fromResult = z.coerce.date().safeParse(fromValue);
  if (!fromResult.success) return null;

  const toResutlt = toValue ? z.coerce.date().safeParse(toValue) : null;
  return toResutlt?.success
    ? { from: fromResult.data, to: toResutlt.data }
    : { from: fromResult.data };
}
