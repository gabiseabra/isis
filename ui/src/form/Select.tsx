import { groupBy, unique } from "@isis/common/utils/array";
import { isNonNullable } from "@isis/common/utils/guards";
import { omit } from "@isis/common/utils/object";
import { Popover as PopoverPrimitive } from "radix-ui";
import React, {
  ComponentProps,
  Fragment,
  KeyboardEvent,
  ReactNode,
  RefObject,
  useMemo,
  useRef,
  useState,
} from "react";
import { BiChevronDown } from "react-icons/bi";
import { IconControl } from "../display/IconControl";
import { Text } from "../display/Text";
import { EmptyState } from "../feedback/EmptyState";
import { Col, ColProps, Row } from "../layout/FlexBox";
import { createBoundary, useBoundary } from "../overlay/Boundary";
import { useOverlay } from "../overlay/OverlayProvider";
import { Slot } from "../utils/slot";
import { Field, FieldProps } from "./Field";
import styles from "./Select.module.scss";
import { BaseInputProps } from "./use-form";

export type Select<T, G> = {
  options: T[];
  selectedOptions: T[];
  groupKeys?: G[];
  groupedOptions?: Map<G, T[]>;
  toggle(option: T): void;
  ref(option: T): RefObject<HTMLElement | null>;
};

export type SelectProps<ID extends string, T, G> = Omit<
  ComponentProps<typeof PopoverPrimitive.Content>,
  "content" | "children"
> & {
  disabled?: boolean;
  autoFocus?: boolean;
  variant?: "default" | "unstyled";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;

  // data
  options: T[];
  optionId: (option: T) => ID;
  onSelectOption?: (option: T) => void;
  groupKey?: (option: T) => G;
  groupId?: (groupKey: G) => string;

  // slots
  optionText?: Slot<(option: T, select: Select<T, G>) => ReactNode>;
  option?: Slot<(option: T, select: Select<T, G>) => ReactNode>;
  group?: Slot<
    (group: G, options: ReactElement[], select: Select<T, G>) => ReactNode
  >;
  placeholder?: Slot<(select: Select<T, G>) => ReactNode>;
  trigger?: Slot<(select: Select<T, G>) => ReactNode>;
  header?: Slot<(select: Select<T, G>) => ReactNode>;
  footer?: Slot<(select: Select<T, G>) => ReactNode>;
  left?: Slot<(select: Select<T, G>) => ReactNode>;
  right?: Slot<(select: Select<T, G>) => ReactNode>;
  emptyState?: Slot<(select: Select<T, G>) => ReactNode>;

  fieldProps?: Partial<FieldProps>;
} & (
    | ({ multiple?: false } & BaseInputProps<ID>)
    | ({ multiple: true } & BaseInputProps<ID[]>)
  );

export function Select<ID extends string, T, G>({
  disabled,
  autoFocus,
  variant = "default",
  className,

  open: controlledOpen,
  onOpenChange: onControlledOpenChange,

  options,
  optionId,
  onSelectOption,
  groupKey,
  groupId,

  optionText = (o) => <Text>{optionId(o)}</Text>,
  option = (o, select) => (
    <Select.Option option={o} select={select}>
      {Slot.render(optionText, o, select)}
    </Select.Option>
  ),
  group = (g, options) => (
    <Col>
      <Text>{String(g)}</Text>

      {options}
    </Col>
  ),
  placeholder = <Text color="muted">Selecione uma opção</Text>,
  trigger = (select) =>
    select.selectedOptions.length
      ? select.selectedOptions.map((o, ix) => (
          <>
            {ix > 0 && ", "} {Slot.render(optionText, o, select)}
          </>
        ))
      : Slot.render(placeholder, select),
  header,
  footer,
  left,
  right,
  emptyState = <EmptyState size="s" title="Sem resultados" />,

  label,
  description,
  error,
  required,
  touched,
  onTouch,

  fieldProps,
  ...props
}: SelectProps<ID, T, G>) {
  const overlay = useOverlay();
  const boundary = useBoundary(Select.Boundary);

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

  const elementsRef = useRef(new Map<ID, HTMLElement>());
  const select: Select<T, G> = useMemo(
    () => ({
      options,
      groupIds:
        groupKey && groupId && unique(options.map(groupKey)).map(groupId),
      groupKeys: groupKey && unique(options.map(groupKey)),
      groupedOptions:
        groupKey &&
        options
          .map((option) => [groupKey(option), option] as const)
          .reduce((map, [id, t]) => {
            if (map.has(id)) map.get(id)?.push(t);
            else map.set(id, [t]);
            return map;
          }, new Map<G, T[]>([])),
      selectedOptions: values
        .map((oid) => options.find((o) => oid === optionId(o)))
        .filter(isNonNullable),
      toggle(option) {
        if (disabled) return;
        const oid = optionId(option);
        if (!props.multiple) {
          if (!values.includes(oid)) props.onChangeValue?.(oid);
        } else {
          if (values.includes(oid))
            props.onChangeValue?.(values.filter((id) => id !== oid));
          else props.onChangeValue?.([...values, oid]);
        }
        onSelectOption?.(option);
      },
      ref: (option) => ({
        get current() {
          return elementsRef.current.get(optionId(option)) ?? null;
        },
        set current(element) {
          if (element) elementsRef.current.set(optionId(option), element);
          else elementsRef.current.delete(optionId(option));
        },
      }),
    }),
    [options, values],
  );

  const onOpenChange = (open: boolean) => {
    if (open && disabled) return;
    if (open && autoFocus) {
      // focus on first selected option
      const firstSelected = options.find((option) =>
        select.selectedOptions.includes(option),
      );
      if (firstSelected) select.ref(firstSelected).current?.focus();
    }
    onControlledOpenChange?.(open);
    setLocalOpen(open);
    if (!open) onTouch?.();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.defaultPrevented || disabled) return;
    const selectedOptionIndex = options.findIndex(
      (option) => select.ref(option)?.current === document.activeElement,
    );
    if (selectedOptionIndex === -1) return;
    const isMod = e.shiftKey || e.metaKey || e.ctrlKey;
    const isOnlyShift = e.shiftKey && !e.metaKey && !e.ctrlKey;
    const shiftOffset =
      (e.key === "ArrowUp" && !isMod) || (e.key === "Tab" && isOnlyShift)
        ? -1
        : (e.key === "ArrowDown" && !isMod) || (e.key === "Tab" && !isMod)
          ? 1
          : null;
    if (shiftOffset) {
      const option =
        options[
          (selectedOptionIndex + shiftOffset + options.length) % options.length
        ];
      if (option) select.ref(option).current?.focus();
      e.preventDefault();
    }
  };

  return (
    <Field
      htmlFor={props.id}
      {...{ label, description, error, required }}
      {...fieldProps}
    >
      <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange}>
        <PopoverPrimitive.Trigger asChild>
          <span
            tabIndex={0}
            className={[styles.Trigger, className].filter(Boolean).join(" ")}
            data-state={open ? "open" : "closed"}
            data-disabled={disabled || undefined}
            data-touched={touched || undefined}
            data-variant={variant}
            onKeyDown={onKeyDown}
          >
            <Row>
              {Slot.render(left, select)}
              {Slot.render(trigger, select)}
            </Row>

            <Row>
              {Slot.render(right, select)}
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
            align="start"
            className={styles.Content}
            onOpenAutoFocus={(e) => e.preventDefault()}
            sideOffset={4}
            collisionPadding={boundary.paddingPx}
            collisionBoundary={boundary.element}
            data-state={open ? "open" : "closed"}
            data-values={values.length ? values.join(";") : undefined}
            {...omit(props, ["multiple", "value", "onChangeValue"])}
            onKeyDown={(e) => {
              props.onKeyDown?.(e);
              onKeyDown(e);
            }}
          >
            <div className={styles.Viewport} role="listbox">
              {Slot.render(header, select)}
              {select.options.length
                ? groupBy(
                    select.options.map(
                      (o) =>
                        [
                          o,
                          reactElement(
                            Slot.render(option, o, select),
                            optionId(o),
                          ),
                        ] as const,
                    ),
                    ([o]) => groupKey?.(o) ?? null,
                  ).map(([g, items]) => (
                    <Fragment key={(g && groupId?.(g)) ?? null}>
                      {g
                        ? Slot.render(
                            group,
                            g,
                            items.map(([, element]) => element),
                            select,
                          )
                        : items.flatMap(([, element]) => element)}
                    </Fragment>
                  ))
                : Slot.render(emptyState, select)}
              {Slot.render(footer, select)}
            </div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    </Field>
  );
}

export type SelectOptionProps<T> = ComponentProps<"div"> & {
  disabled?: boolean;
  option: T;
  select?: Select<T, unknown>;
  onToggle?: () => void;
};

Select.Option = function SelectOption<T>({
  className,
  disabled,
  select,
  option,
  ...props
}: SelectOptionProps<T>) {
  return (
    <div
      ref={(element) => {
        if (select) select.ref(option).current = element;
      }}
      tabIndex={0}
      aria-disabled={disabled || undefined}
      className={[styles.Item, className].filter(Boolean).join(" ")}
      data-disabled={disabled ? "" : undefined}
      data-selected={select?.selectedOptions.includes(option) || undefined}
      role="option"
      {...props}
      onClick={(e) => {
        select?.toggle(option);
        props.onClick?.(e);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          select?.toggle(option);
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    />
  );
};

export type SelectGroupProps = ColProps & {
  label: ReactNode;
};

Select.Group = function SelectGroup({
  label,
  className,
  children,
  ...props
}: SelectGroupProps) {
  return (
    <Col
      className={[styles.Section, className].filter(Boolean).join(" ")}
      role="option"
      {...props}
    >
      <Row alignX="space-between">
        <Text as="h5">{label}</Text>
      </Row>

      <div className={styles.GroupContent}>{children}</div>
    </Col>
  );
};

Select.Boundary = createBoundary();

type ReactElement = React.ReactElement & { key: string | null };

function reactElement(children: ReactNode, key: string | null): ReactElement {
  return <Fragment key={key}>{children}</Fragment>;
}
