import { DayPicker, type DateRange } from "@daypicker/react";
import "@daypicker/react/style.css";
import { useRef, useState, type ComponentProps } from "react";
import { BiCalendar } from "react-icons/bi";
import z from "zod";
import { IconControl } from "../display/IconControl";
import { Col } from "../layout/FlexBox";
import { Popover } from "../overlay/Popover";
import styles from "./DateInput.module.scss";
import { Field } from "./Field";
import { BaseInputProps } from "./use-form";

export type DateInputProps = Omit<
  ComponentProps<"input">,
  "size" | "value" | "defaultValue"
> & {
  size?: "s" | "m" | "l";
  closeOnSelect?: boolean;
} & (
    | ({ mode?: "single" } & BaseInputProps<Date>)
    | ({ mode: "range" } & BaseInputProps<DateRange>)
  );

export function DateInput({
  size = "m",
  closeOnSelect,
  label,
  description,
  error,
  required,
  touched,
  onTouch,
  className,
  disabled,
  ...props
}: DateInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const initialMonth = (() => {
    if (props.mode === "range")
      return props.value?.from ?? props.value?.to ?? new Date();
    return props.value ?? new Date();
  })();
  const initialDisplayValue =
    props.mode === "range"
      ? formatDateRange(props.value)
      : props.value
        ? formatDate(props.value)
        : "";

  const [displayValue, setDisplayValue] = useState(initialDisplayValue);
  const [open, setOpen] = useState(false);

  const setValue = (value: string) => {
    setDisplayValue(value);
    if (props.mode === "range") {
      const range = parseDateRange(value);
      if (range) props.onChangeValue?.(range);
    } else {
      const date = parseDate(value);
      if (date) props.onChangeValue?.(date);
    }
  };

  const onOpenChange = (nextOpen: boolean) => {
    if (nextOpen && disabled) return;
    setOpen(nextOpen);
    if (!nextOpen) onTouch?.();
  };

  return (
    <Field htmlFor={props.id} {...{ label, description, error, required }}>
      <Popover
        align="center"
        body={{ className: styles.Body }}
        content={
          <Col alignX="center" py={2} px={4} className={styles.Content}>
            {props.mode === "range" ? (
              <DayPicker
                className={styles.Calendar}
                mode="range"
                defaultMonth={initialMonth}
                selected={props.value}
                onSelect={(range) => {
                  if (range) {
                    props.onChangeValue?.(range);
                    setDisplayValue(formatDateRange(range));
                    if (closeOnSelect) setOpen(false);
                  }
                }}
              />
            ) : (
              <DayPicker
                className={styles.Calendar}
                mode="single"
                defaultMonth={initialMonth}
                selected={props.value}
                onSelect={(date) => {
                  if (date) {
                    props.onChangeValue?.(date);
                    setDisplayValue(formatDate(date));
                    if (closeOnSelect) setOpen(false);
                  }
                }}
              />
            )}
          </Col>
        }
        open={open}
        onOpenChange={onOpenChange}
        sideOffset={0.5}
      >
        <span
          className={styles.InputWrapper}
          data-disabled={disabled || undefined}
          data-state={open ? "open" : "closed"}
          data-size={size}
        >
          <input
            {...props}
            ref={inputRef}
            type="text"
            disabled={disabled}
            required={required}
            value={displayValue}
            onChange={(e) => setValue(e.currentTarget.value)}
            data-touched={touched || undefined}
            defaultValue={displayValue}
            className={[styles.Input, className].filter(Boolean).join(" ")}
            autoComplete="off"
            aria-expanded={open}
            aria-haspopup="dialog"
          />
          <span className={[styles.Slot, styles.RightSlot].join(" ")}>
            <IconControl
              as="span"
              className={styles.Icon}
              color="muted"
              size="s"
            >
              <BiCalendar />
            </IconControl>
          </span>
        </span>
      </Popover>
    </Field>
  );
}

function formatDate(date: Date) {
  return date.toLocaleDateString();
}

function formatDateRange(range: DateRange | undefined) {
  if (!range?.from) return "";
  if (!range.to) return formatDate(range.from);
  return `${formatDate(range.from)} – ${formatDate(range.to)}`;
}

function parseDate(value: string): Date | null {
  const date = value
    .trim()
    .replace(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, (_, day, month, year) =>
      [year, month.padStart(2, "0"), day.padStart(2, "0")].join("-"),
    );
  const result = z.iso.date().safeParse(date);
  if (!result.success) return null;

  const [year, month, day] = result.data.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function parseDateRange(range: string): DateRange | null {
  const [fromValue, toValue] = range.split(/\s+[–-]\s+/, 2);
  const from = parseDate(fromValue);
  if (!from) return null;

  const to = toValue ? parseDate(toValue) : null;
  return to ? { from, to } : { from };
}
