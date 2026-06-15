import { type ComponentProps, useEffect, useRef } from "react";
import { useField } from "./Field";
import styles from "./Textarea.module.scss";

export type TextareaProps = ComponentProps<"textarea"> & {
  autoGrow?: boolean;
};

export function Textarea({
  ref,
  autoGrow = false,
  className = "",
  onInput,
  rows,
  value,
  ...props
}: TextareaProps) {
  const fieldProps = useField(props);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoGrow && textareaRef.current) {
      fitTextarea(textareaRef.current);
    }
  }, [autoGrow]);

  return (
    <textarea
      {...props}
      {...fieldProps}
      ref={(element) => {
        textareaRef.current = element;
        if (ref instanceof Function) ref(element);
        else if (ref) ref.current = element;
      }}
      rows={rows}
      value={value}
      className={[styles.Textarea, autoGrow && styles.autogrow, className]
        .filter(Boolean)
        .join(" ")}
      onInput={(event) => {
        if (autoGrow) {
          fitTextarea(event.currentTarget);
        }

        onInput?.(event);
      }}
    />
  );
}

function fitTextarea(textarea: HTMLTextAreaElement) {
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
}
