import { Select as SelectPrimitive } from "radix-ui";
import { type ComponentProps, type ReactNode } from "react";
import { BiCheck, BiChevronDown } from "react-icons/bi";
import { useOverlay } from "../context/OverlayProvider";
import { IconControl } from "../display/IconControl";
import styles from "./Dropdown.module.scss";
import { useField } from "./Field";

export type DropdownProps = ComponentProps<typeof SelectPrimitive.Root> & {
  id?: string;
  className?: string;
  placeholder?: ReactNode;
  onFocus?: () => void;
  onBlur?: () => void;
};

export function Dropdown({
  id,
  onFocus,
  onBlur,
  className,
  placeholder,
  children,
  ...props
}: DropdownProps) {
  const overlay = useOverlay();
  const fieldProps = useField({ onFocus, onBlur });

  return (
    <SelectPrimitive.Root {...props}>
      <SelectPrimitive.Trigger
        id={id}
        className={[styles.Trigger, className].filter(Boolean).join(" ")}
        {...fieldProps}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon className={styles.Icon} asChild>
          <IconControl as="span" size="s" color="muted">
            <BiChevronDown />
          </IconControl>
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal container={overlay.root}>
        <SelectPrimitive.Content
          className={styles.Content}
          position="popper"
          sideOffset={4}
        >
          <SelectPrimitive.Viewport className={styles.Viewport}>
            {children}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

export type DropdownItemProps = ComponentProps<typeof SelectPrimitive.Item>;

export function DropdownItem({
  className,
  children,
  ...props
}: DropdownItemProps) {
  return (
    <SelectPrimitive.Item
      className={[styles.Item, className].filter(Boolean).join(" ")}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}
