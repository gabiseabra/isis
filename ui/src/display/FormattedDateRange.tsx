import { DateRange } from "@isis/common/dto/date-range";
import { ReactNode } from "react";
import { FormattedDate } from "./FormattedDate";
import { Text, TextProps } from "./Text";

export function FormattedDateRange({
  value,
  placeholder,
  ...props
}: TextProps & { value: DateRange; placeholder?: ReactNode }) {
  if (value && value.from)
    return <Text {...props}>{FormattedDateRange.format(value)}</Text>;
  return (
    <Text color="muted" {...props}>
      {placeholder}
    </Text>
  );
}

FormattedDateRange.format = function formatDateRange(range: DateRange) {
  if (!range.from) return "";
  if (!range.to) return FormattedDate.format(range.from);
  return [
    FormattedDate.format(range.from),
    "—",
    FormattedDate.format(range.to),
  ].join(" ");
};
