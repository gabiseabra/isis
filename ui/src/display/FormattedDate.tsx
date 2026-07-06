import { Text, TextProps } from "./Text";

export function FormattedDate({
  value,
  ...props
}: TextProps & { value: Date }) {
  return <Text {...props}>{FormattedDate.format(value)}</Text>;
}

FormattedDate.format = function formatDate(date: Date) {
  return date.toLocaleDateString();
};
