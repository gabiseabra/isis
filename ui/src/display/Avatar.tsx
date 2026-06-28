import { extractInitials } from "@isis/common/utils/string";
import { Avatar as AvatarPrimitive } from "radix-ui";
import { ComponentProps, ReactNode, useState } from "react";
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
  size: "s" | "m" | "l" | "auto";
};

export function Avatar({
  src,
  title,
  fallback,
  size,
  className,
  ...props
}: AvatarProps) {
  const [loadingStatus, setLoadingStatus] = useState<
    "idle" | "loading" | "loaded" | "error"
  >("idle");

  fallback ||= extractInitials(title);

  return (
    <AvatarPrimitive.Root asChild title={title} {...props}>
      <Row
        alignX="center"
        alignY="center"
        className={[styles.Root, className].filter(Boolean).join(" ")}
        data-size={size}
        data-status={loadingStatus}
      >
        {src && (
          <AvatarPrimitive.Image
            src={src}
            alt={title}
            className={styles.Image}
            onLoadingStatusChange={setLoadingStatus}
          />
        )}
        <AvatarPrimitive.Fallback asChild>
          <Text as="div" color="currentColor" font="sans-serif" align="center">
            {fallback}
          </Text>
        </AvatarPrimitive.Fallback>
      </Row>
    </AvatarPrimitive.Root>
  );
}
