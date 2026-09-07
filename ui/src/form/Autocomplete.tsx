import { DistributiveOmit } from "@isis/common/types/union";
import { escapeRegExp } from "@isis/common/utils/regexp";
import { Slot } from "@isis/common/utils/slot";
import { Fragment, KeyboardEvent, ReactNode, useRef, useState } from "react";
import { BiX } from "react-icons/bi";
import { Badge } from "../display/Badge";
import { IconButton } from "../display/IconButton";
import { IconControl } from "../display/IconControl";
import { Text } from "../display/Text";
import { Select, SelectProps, useSelect } from "./Select";

export type AutocompleteProps<ID extends string, T, G> = DistributiveOmit<
  SelectProps<ID, T, G>,
  "trigger" | "placeholder" | "optionText"
> & {
  placeholder?: string;
  optionText: Slot<(option: T, select: Select<T, G>) => string>;
  optionBadge?: Slot<(option: T, select: Select<T, G>) => ReactNode>;
  setQueryOnSelect?: boolean;
};

export function Autocomplete<ID extends string, T, G>({
  placeholder,
  isVisible = () => true,
  open: controlledOpen,
  onOpenChange: onControlledOpenChange,
  optionText,
  optionBadge = (option, select) => (
    <Autocomplete.OptionButton option={option} select={select}>
      <Text noWrap>{Slot.extract(optionText, option, select)}</Text>
    </Autocomplete.OptionButton>
  ),
  left,
  right,
  ...props
}: AutocompleteProps<ID, T, G>) {
  const selectRef = useRef<Select<T, G>>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [localOpen, setLocalOpen] = useState(false);
  const [query, setQuery] = useState<string | null>(null);

  const queryRegExp = query ? new RegExp(escapeRegExp(query), "i") : null;

  const { selectedOptions } = useSelect(props);

  return (
    <Select
      ref={selectRef}
      isVisible={(o) =>
        isVisible(o) &&
        ((selectRef.current &&
          queryRegExp?.test(Slot.extract(optionText, o, selectRef.current))) ??
          true)
      }
      optionText={optionText}
      trigger={(select) => (
        <Select.Trigger
          select={select}
          size={props.size}
          variant={props.variant}
          left={left}
          right={right}
          wrap
        >
          {((select) =>
            select &&
            props.multiple &&
            selectedOptions.map((option) => (
              <Fragment key={props.optionId(option)}>
                {Slot.extract(optionBadge, option, select)}
              </Fragment>
            )))(selectRef.current)}

          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={
              query ??
              ((select) =>
                select && !props.multiple
                  ? selectedOptions
                      .map((option) => Slot.extract(optionText, option, select))
                      .join(", ")
                  : "")(selectRef.current)
            }
            onChange={(e) => setQuery(e.currentTarget.value)}
          />
        </Select.Trigger>
      )}
      {...props}
      open={controlledOpen ?? localOpen}
      onOpenChange={(open) => {
        if (!open && inputRef.current === document.activeElement) return;

        onControlledOpenChange?.(open);
        setLocalOpen(open);
        setQuery(null);
      }}
      onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
        props.onKeyDown?.(e);

        if (e.defaultPrevented) return;

        if (
          e.key.length === 1 &&
          !e.metaKey &&
          !e.ctrlKey &&
          !e.altKey &&
          e.key !== " "
        ) {
          setQuery(e.key);
          inputRef.current?.focus();
          inputRef.current?.setSelectionRange(1, 1);
          e.preventDefault();
        }
      }}
    />
  );
}

export type AutocompleteOptionButtonProps<T, G> = {
  option: T;
  select: Select<T, G>;
  children: ReactNode;
};

Autocomplete.OptionButton = function AutocompleteOptionButton<T, G>({
  option,
  select,
  children,
}: AutocompleteOptionButtonProps<T, G>) {
  return (
    <Badge size="m" color="blue">
      {children}

      <IconButton
        type="button"
        variant="sheer"
        my={-1}
        ml={0.5}
        mr={-0.5}
        p={0.5}
        radius={0.5}
        onClick={(e) => {
          select.toggle(option);
          e.stopPropagation();
        }}
      >
        <IconControl size="xs" color="blue">
          <BiX />
        </IconControl>
      </IconButton>
    </Badge>
  );
};
