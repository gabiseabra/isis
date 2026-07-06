import { Text, TextProps } from "./Text";

export function FormattedNumber({
  value,
  ...props
}: TextProps & { value: number }) {
  return <Text {...props}>{value}</Text>;
}
