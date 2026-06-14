import { omit } from "@isis/common/utils/object";
import { ComponentPropsWithoutRef, HTMLAttributes, Ref } from "react";
import * as css from "../utils/css";
import styles from "./Text.module.scss";

export type TextProps = {
  ref?: Ref<HTMLElement>;
  as?: TextTag;
  size?: TextSize;
  color?: TextColor;
  indent?: number;
  disabled?: boolean;
} & css.MarginProps &
  css.PaddingProps &
  HTMLAttributes<HTMLElement>;

type TextTag = "div" | "p" | "blockquote" | "h1" | "h2" | "h3" | "h4" | "h5";

type TextColor = css.Color | "disabled" | "muted" | "link";

type TextSize = "caption" | "body" | "h1" | "h2" | "h3" | "h4" | "h5";

/**
 * A block element meant for wrapping around text.
 * @direction block
 */
export function Text({
  ref,
  as: Tag = "div",
  size,
  color,
  indent,
  children,
  className,
  style = {},
  ...props
}: TextProps) {
  return (
    <Tag
      ref={
        ref &&
        ((element: HTMLElement | null) => {
          if (ref instanceof Function) ref(element);
          else ref.current = element;
        })
      }
      className={[
        styles.text,
        indent && styles[`indent-${{ 1: 1, 2: 2, 3: 3, 4: 4 }[indent] ?? 0}`],
        size && styles[`size-${size}`],
        color && styles[`color-${color}`],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        ...css.getPaddingStyles(props),
        ...css.getMarginStyles(props),
        ...style,
      }}
      {...omit(props, [...css.marginProps, ...css.paddingProps])}
    >
      {children}
    </Tag>
  );
}

export type Annotations = {
  size?: TextSize;
  color?: TextColor;
  redacted?: boolean;
  bold?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  underline?: boolean;
  code?: boolean;
};
export type SpanProps = Annotations & ComponentPropsWithoutRef<"span">;

/**
 * An inline element for text with annotations.
 * @direction inline
 */
export function Span({ children, style, className, ...props }: SpanProps) {
  return (
    <span
      style={style}
      className={[className, Span.className(props)].filter(Boolean).join(" ")}
      {...omit(props, [...annotationProps])}
    >
      {children}
    </span>
  );
}

Span.className = ({
  bold,
  italic,
  underline,
  strikethrough,
  code,
  color,
  redacted,
  size,
}: Annotations) => {
  return [
    styles.span,
    bold && styles.bold,
    italic && styles.italic,
    underline && styles.underline,
    strikethrough && styles.strikethrough,
    code && styles.code,
    redacted && styles.redacted,
    size && styles[`size-${size}`],
    color && color !== "default" && styles[`color-${color}`],
  ]
    .filter(Boolean)
    .join(" ");
};

const annotationProps = [
  "bold",
  "italic",
  "underline",
  "strikethrough",
  "code",
  "color",
  "redacted",
  "size",
] as const;
