import {
  CaptionLabelProps,
  ChevronProps,
  DayPicker,
  DayPickerProps,
  MonthCaptionProps,
} from "@daypicker/react";
import "@daypicker/react/dist/style.css";
import { ComponentProps } from "react";
import {
  BiChevronDown,
  BiChevronLeft,
  BiChevronRight,
  BiChevronUp,
} from "react-icons/bi";
import { Row } from "../layout/FlexBox";
import { Color } from "../utils/css";
import { IconButton } from "./IconButton";
import { IconControl } from "./IconControl";
import { Span, Text } from "./Text";

export type CalendarProps = DayPickerProps & {
  color?: Color;
};

export function Calendar({ color = "primary", ...props }: CalendarProps) {
  return (
    <DayPicker
      components={{
        Chevron: Calendar.Chevron,
        CaptionLabel: Calendar.Label,
        MonthCaption: Calendar.Header,
        NextMonthButton: Calendar.Button,
        PreviousMonthButton: Calendar.Button,
      }}
      style={{
        "--rdp-accent-color": `var(--color-${color})`,
        "--rdp-accent-background-color": `var(--bg-${color})`,
        "--rdp-today-color": `var(--color-${color})`,
      }}
      {...props}
    />
  );
}

Calendar.Chevron = function CalendarChevron({
  className,
  style,
  size,
  disabled,
  orientation = "left",
}: ChevronProps) {
  return (
    <IconControl
      className={className}
      color={disabled ? "disabled" : "currentColor"}
      style={{
        color: "var(--rdp-accent-color)",
        height: size,
        ...style,
      }}
    >
      {
        {
          left: <BiChevronLeft />,
          right: <BiChevronRight />,
          up: <BiChevronUp />,
          down: <BiChevronDown />,
        }[orientation]
      }
    </IconControl>
  );
};

Calendar.Label = function CalendarLabel({
  color: _color,
  ...props
}: CaptionLabelProps) {
  return (
    <Text as="h4" font="heading" m={0}>
      <Span {...props} />
    </Text>
  );
};

Calendar.Button = function CalendarButton({
  color: _color,
  style,
  children = " ",
  ...props
}: ComponentProps<"button">) {
  return (
    <IconButton
      color="currentColor"
      style={{ color: "var(--rdp-accent-color)", ...style }}
      {...props}
    >
      {children}
    </IconButton>
  );
};

Calendar.Header = function CalendarHeader(props: Partial<MonthCaptionProps>) {
  return <Row alignY="center" {...props} />;
};
