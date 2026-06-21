import { extractInitials } from "@isis/common/utils/string";
import { Avatar as AvatarPrimitive } from "radix-ui";
import { ComponentProps, ReactNode } from "react";
import { Row } from "../layout/FlexBox";
import styles from "./Avatar.module.scss";
import { Text } from "./Text";

export type AvatarProps = Omit<
  ComponentProps<typeof AvatarPrimitive.Root>,
  "asChild" | "children"
> & {
  src?: string;
  title: string;
  fallback?: ReactNode;
  size: "s" | "m" | "l";
};

export function Avatar({
  src,
  title,
  fallback = extractInitials(title),
  size,
  className,
  ...props
}: AvatarProps) {
  return (
    <AvatarPrimitive.Root asChild {...props}>
      <Row
        alignX="center"
        alignY="center"
        className={[styles.Root, styles[`size-${size}`], className]
          .filter(Boolean)
          .join(" ")}
      >
        {src && (
          <AvatarPrimitive.Image
            src={src}
            alt={title}
            className={styles.Image}
          />
        )}
        <AvatarPrimitive.Fallback asChild>
          <Text as="div" color="currentColor" font="subheading">
            {fallback}
          </Text>
        </AvatarPrimitive.Fallback>
      </Row>
    </AvatarPrimitive.Root>
  );
}
