import {
  CaptionLabelProps,
  ChevronProps,
  DayPicker,
  DayPickerProps,
  MonthCaptionProps,
} from "@daypicker/react";
import "@daypicker/react/dist/style.css";
import {
  BiChevronDown,
  BiChevronLeft,
  BiChevronRight,
  BiChevronUp,
} from "react-icons/bi";
import { Row } from "../layout/FlexBox";
import { Color } from "../utils/css";
import { IconControl } from "./IconControl";
import { Span, Text } from "./Text";

export type CalendarProps = DayPickerProps & {
  color?: Color;
};

export function Calendar({ color = "primary", ...props }: CalendarProps) {
  return (
    <DayPicker
      components={{
        Chevron: Calendar.Crevron,
        CaptionLabel: Calendar.Label,
        MonthCaption: Calendar.Header,
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

Calendar.Crevron = function CalendarCrevron({
  className,
  style,
  size,
  disabled,
  orientation = "left",
}: ChevronProps) {
  return (
    <IconControl
      size="auto"
      height={size}
      className={className}
      disabled={disabled}
      color="currentColor"
      style={{ color: "var(--rdp-accent-color)", ...style }}
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

Calendar.Header = function CalendarHeader(props: MonthCaptionProps) {
  return <Row alignY="center" {...props} />;
};
