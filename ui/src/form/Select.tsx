import { uniqueBy } from "@isis/common/utils/array";
import {
  hasNonNullableProperty,
  hasPropertyValue,
  isNonNullable,
} from "@isis/common/utils/guards";
import { omit } from "@isis/common/utils/object";
import { Popover as PopoverPrimitive } from "radix-ui";
import {
  ComponentProps,
  createContext,
  KeyboardEvent,
  ReactNode,
  Ref,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { BiChevronDown } from "react-icons/bi";
import { IconControl } from "../display/IconControl";
import { Text } from "../display/Text";
import { Col, ColProps, Row } from "../layout/FlexBox";
import { createBoundary, useBoundary } from "../overlay/Boundary";
import { useOverlay } from "../overlay/OverlayProvider";
import styles from "./Select.module.scss";

export type SelectOption = {
  value: string;
  textValue?: string;
};

export type Select = {
  mounted: boolean;
  trigger: HTMLElement | null;
  content: HTMLElement | null;
  options: (SelectOption & {
    active: boolean;
  })[];
  tab: (value: string, direction: 1 | 0 | -1) => void;
  toggle: (value: string) => void;
  register: (option: SelectOption) => () => void;
};

const SelectContext = createContext<Select>({
  mounted: false,
  trigger: null,
  content: null,
  options: [],
  tab() {},
  toggle() {},
  register: () => () => {},
});

export function useSelect() {
  return useContext(SelectContext);
}

export function useSelectOption(base: SelectOption) {
  const select = useSelect();

  useEffect(() => select.register(base), [base.value, base.textValue]);

  return {
    active: false,
    ...base,
    ...select.options.find((option) => option.value === base.value),
    onToggle() {
      select.toggle(base.value);
    },
  };
}

export type SelectProps = Omit<
  ComponentProps<typeof PopoverPrimitive.Content>,
  "content" | "ref"
> & {
  ref?: Ref<Select>;
  disabled?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
  trigger?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  left?: ReactNode;
  right?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelectOption?: (option: SelectOption) => void;
} & (
    | {
        multiple?: false;
        value?: string;
        onValueChange?: (value: string) => void;
      }
    | {
        multiple: true;
        value?: string[];
        onValueChange?: (value: string[]) => void;
      }
  );

export function Select({
  ref,
  disabled,
  autoFocus,
  placeholder,
  trigger = <Select.Trigger placeholder={placeholder} />,
  children,
  className,
  header,
  footer,
  left,
  right,
  open: controlledOpen,
  onOpenChange: onControlledOpenChange,
  onSelectOption,
  ...props
}: SelectProps) {
  const overlay = useOverlay();
  const boundary = useBoundary(Select.Boundary);
  const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(
    null,
  );
  const [contentElement, setContentElement] = useState<HTMLElement | null>(
    null,
  );
  const [mountedOptions, setMountedOptions] = useState<
    (SelectOption & { id: number })[]
  >([]);
  const [localOpen, setLocalOpen] = useState(false);

  const open = controlledOpen ?? localOpen;
  const values = useMemo(
    () =>
      props.multiple
        ? (props.value ?? [])
        : typeof props.value === "string"
          ? [props.value]
          : [],
    [props.multiple, props.value],
  );
  const options = useMemo(
    () =>
      uniqueBy(mountedOptions, (option) => option.value)
        .map((option) => ({
          ...option,
          active: values.includes(option.value),
          element: contentElement?.querySelector<HTMLElement>(
            `[data-value=${option.value}]`,
          ),
        }))
        .sort((a, b) => {
          if (a.element && b.element) {
            const position = a.element.compareDocumentPosition(b.element);
            if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
            if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
          }
          if (!a.element) return 1;
          if (!b.element) return -1;
          return 0;
        }),
    [values, mountedOptions, contentElement],
  );
  const select = useMemo<Select>(
    () => ({
      mounted: !!triggerElement && !!contentElement,
      trigger: triggerElement,
      content: contentElement,
      options,
      tab(value, direction) {
        const visibleOptions = options.filter(
          hasNonNullableProperty("element"),
        );
        const currentIndex = visibleOptions.findIndex(
          (option) => option.value === value,
        );
        visibleOptions[
          (visibleOptions.length + currentIndex + direction) %
            visibleOptions.length
        ]?.element.focus();
      },
      toggle(value) {
        const option = options.find((option) => option.value === value);
        if (option) onSelectOption?.(option);

        if (values.includes(value))
          onValueChange(values.filter((v) => v !== value));
        else onValueChange([value, ...values]);
      },
      register(option) {
        const id = Math.random();
        setMountedOptions((options) => [
          ...options.filter((option) => option.value === option.value),
          { ...option, id },
        ]);
        return () =>
          setMountedOptions((options) => [
            ...options.filter((option) => option.id === id),
          ]);
      },
    }),
    [triggerElement, contentElement, options],
  );

  const onValueChange = (values: string[]) => {
    if (disabled) return;
    if (props.multiple) props.onValueChange?.(values);
    else if (values[0]) props.onValueChange?.(values[0]);
  };
  const onOpenChange = (open: boolean) => {
    if (open && disabled) return;
    if (open && autoFocus) {
      options
        .find(
          (option) => values.findIndex((value) => value === option.value) > -1,
        )
        ?.element?.focus();
    }
    onControlledOpenChange?.(open);
    setLocalOpen(open);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.defaultPrevented || disabled) return;

    const selectedOption =
      options.find((option) => option.element === document.activeElement) ??
      options[options.length - 1];

    if (!selectedOption) return;

    const isMod = e.shiftKey || e.metaKey || e.ctrlKey;
    const isOnlyShift = e.shiftKey && !e.metaKey && !e.ctrlKey;
    if ((e.key === "ArrowUp" && !isMod) || (e.key === "Tab" && !isMod))
      select.tab(selectedOption.value, -1);
    else if (
      (e.key === "ArrowDown" && !isMod) ||
      (e.key === "Tab" && isOnlyShift)
    )
      select.tab(selectedOption.value, 1);
    else return;
    e.preventDefault();
  };

  useImperativeHandle(ref, () => select, [select]);

  return (
    <SelectContext.Provider value={select}>
      <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange}>
        <PopoverPrimitive.Trigger ref={setTriggerElement} asChild>
          <span
            tabIndex={0}
            className={[styles.Trigger, className].filter(Boolean).join(" ")}
            data-state={open ? "open" : "closed"}
            data-disabled={disabled || undefined}
            onKeyDown={onKeyDown}
          >
            <Row>
              {left}
              {trigger}
            </Row>

            <Row>
              {right}
              <IconControl
                as="span"
                className={styles.Icon}
                color="muted"
                size="s"
              >
                <BiChevronDown />
              </IconControl>
            </Row>
          </span>
        </PopoverPrimitive.Trigger>

        <PopoverPrimitive.Portal forceMount container={overlay.root}>
          <PopoverPrimitive.Content
            ref={setContentElement}
            align="start"
            className={styles.Content}
            onOpenAutoFocus={(e) => e.preventDefault()}
            sideOffset={4}
            collisionPadding={boundary.paddingPx}
            collisionBoundary={boundary.element}
            data-state={open ? "open" : "closed"}
            data-values={values.length ? values.join(";") : undefined}
            {...omit(props, ["multiple", "value", "onValueChange"])}
            onKeyDown={(e) => {
              props.onKeyDown?.(e);
              onKeyDown(e);
            }}
          >
            <div className={styles.Viewport} role="listbox">
              {header}
              {children}
              {footer}
            </div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    </SelectContext.Provider>
  );
}

type SelectTriggerProps = {
  placeholder?: ReactNode;
  render?: (option: SelectOption) => ReactNode;
  join?: (a: ReactNode, b: ReactNode) => ReactNode;
};

Select.Trigger = function SelectTrigger({
  placeholder,
  render = (option) => option.textValue ?? option.value,
  join = (a, b) => (
    <>
      {a}, {b}
    </>
  ),
}: SelectTriggerProps) {
  const select = useSelect();
  const activeOptions = select.options.filter((option) => option.active);
  const [first, ...rest] = activeOptions;

  if (!select.mounted) return <Text />;

  if (!first)
    return (
      <Text as="div" color="muted">
        {placeholder}
      </Text>
    );

  return <Row gap={0}>{rest.map(render).reduce(join, render(first))}</Row>;
};

export type SelectItemProps = ComponentProps<"div"> & {
  value: string;
  disabled?: boolean;
  textValue?: string;
};

Select.Item = function SelectItem({
  value,
  textValue,
  className,
  disabled,
  ...props
}: SelectItemProps) {
  const { active, onToggle } = useSelectOption({
    value,
    textValue,
  });

  return (
    <div
      tabIndex={0}
      aria-disabled={disabled || undefined}
      className={[styles.Item, className].filter(Boolean).join(" ")}
      data-disabled={disabled ? "" : undefined}
      data-value={value}
      data-text-value={textValue}
      data-active={active || undefined}
      role="option"
      {...props}
      onClick={(e) => {
        onToggle();
        props.onClick?.(e);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onToggle();
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    />
  );
};

export type SelectSectionProps = ColProps & {
  label: ReactNode;
  emptyState?: ReactNode;
};

Select.Section = function SelectSection({
  ref,
  label,
  emptyState,
  className,
  children,
  ...props
}: SelectSectionProps) {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const select = useSelect();

  const visibleOptions = Array.from(
    element?.querySelectorAll<HTMLElement>("[data-value]") ?? [],
  )
    .map((element) =>
      select.options.map(
        hasPropertyValue("value", element.dataset["value"] ?? ""),
      ),
    )
    .filter(isNonNullable);
  const activeElement = element?.querySelector("[data-active]");

  return (
    <Col
      ref={(element) => {
        setElement(element);
        if (ref instanceof Function) ref(element);
        else if (ref) ref.current = element;
      }}
      className={[styles.Section, className].filter(Boolean).join(" ")}
      data-active={!!activeElement}
      data-empty={!visibleOptions.length}
      role="option"
      {...props}
    >
      <Row alignX="space-between">
        <Text as="h5">{label}</Text>
      </Row>

      {!visibleOptions.length && emptyState}

      <div className={styles.GroupContent}>{children}</div>
    </Col>
  );
};

Select.Boundary = createBoundary();
