import { DayPicker, DayPickerProps } from "@daypicker/react";
import styles from "./Calendar.module.scss";

export type CalendarProps = DayPickerProps;

export function Calendar({ className, ...props }: CalendarProps) {
  return (
    <DayPicker
      className={[styles.Calendar, className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}
