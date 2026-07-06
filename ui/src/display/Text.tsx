import { omit } from "@isis/common/utils/object";
import { ComponentProps, HTMLAttributes, Ref } from "react";
import * as css from "../utils/css";
import styles from "./Text.module.scss";

export type TextProps = {
  ref?: Ref<HTMLElement>;
  as?: TextTag;
  size?: TextSize;
  color?: TextColor;
  background?: css.Color;
  font?: TextFont;
  indent?: number;
  align?: "left" | "right" | "center" | "start" | "end";
  disabled?: boolean;
} & css.MarginProps &
  css.PaddingProps &
  HTMLAttributes<HTMLElement>;

type TextTag = "div" | "p" | "blockquote" | "h1" | "h2" | "h3" | "h4" | "h5";

type TextColor = css.Color | "disabled" | "muted" | "link" | "currentColor";

type TextSize = "caption" | "body" | "h1" | "h2" | "h3" | "h4" | "h5";

type TextFont =
  | "body"
  | "heading"
  | "subheading"
  | "monospace"
  | "serif"
  | "sans-serif";

/**
 * A block element meant for wrapping around text.
 * @direction block
 */
export function Text({
  ref,
  as: Tag = "div",
  size,
  color,
  background,
  font,
  indent,
  align,
  children,
  className,
  style = {},
  ...props
}: TextProps) {
  const dataIndent = indent && indent >= 1 && indent <= 4 ? indent : undefined;

  return (
    <Tag
      ref={
        ref &&
        ((element: HTMLElement | null) => {
          if (ref instanceof Function) ref(element);
          else ref.current = element;
        })
      }
      className={[styles.Text, className].filter(Boolean).join(" ")}
      style={{
        ...css.getPaddingStyles(props),
        ...css.getMarginStyles(props),
        ...style,
      }}
      data-align={align}
      data-color={color && color !== "default" ? color : undefined}
      data-background={
        background && background !== "default" ? background : undefined
      }
      data-font={font}
      data-indent={dataIndent}
      data-size={size}
      {...omit(props, [...css.marginProps, ...css.paddingProps])}
    >
      {children}
    </Tag>
  );
}

export type Annotations = {
  size?: TextSize;
  color?: TextColor;
  background?: css.Color;
  redacted?: boolean;
  bold?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  underline?: boolean;
  code?: boolean;
};
export type SpanProps = Annotations & ComponentProps<"span">;

/**
 * An inline element for text with annotations.
 * @direction inline
 */
export function Span({
  children,
  style,
  className,
  bold,
  italic,
  underline,
  strikethrough,
  code,
  color,
  background,
  redacted,
  size,
  ...props
}: SpanProps) {
  return (
    <span
      style={style}
      className={[styles.Span, className].filter(Boolean).join(" ")}
      data-bold={bold || undefined}
      data-code={code || undefined}
      data-color={color && color !== "default" ? color : undefined}
      data-background={
        background && background !== "default" ? background : undefined
      }
      data-size={size}
      data-italic={italic || undefined}
      data-redacted={redacted || undefined}
      data-strikethrough={strikethrough || undefined}
      data-underline={underline || undefined}
      {...props}
    >
      {children}
    </span>
  );
}
