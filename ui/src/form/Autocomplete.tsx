import { DistributiveOmit } from "@isis/common/types/union";
import { escapeRegExp } from "@isis/common/utils/regexp";
import { KeyboardEvent, useRef, useState } from "react";
import { Select, SelectProps } from "./Select";

export type AutocompleteProps<ID extends string, T, G> = DistributiveOmit<
  SelectProps<ID, T, G>,
  "trigger" | "placeholder" | "optionText"
> & {
  placeholder?: string;
  optionText: (option: T) => string;
  setQueryOnSelect?: boolean;
};

export function Autocomplete<ID extends string, T, G>({
  placeholder,
  options,
  open: controlledOpen,
  onOpenChange: onControlledOpenChange,
  optionText,
  left,
  right,
  ...props
}: AutocompleteProps<ID, T, G>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localOpen, setLocalOpen] = useState(false);
  const [query, setQuery] = useState("");

  const queryRegExp = query ? new RegExp(escapeRegExp(query)) : null;

  return (
    <Select
      options={options.filter((o) => queryRegExp?.test(optionText(o)) ?? true)}
      optionText={optionText}
      trigger={(select) => (
        <Select.Trigger
          select={select}
          size={props.size}
          variant={props.variant}
          left={left}
          right={right}
        >
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={
              query ||
              select.selectedOptions
                .map((option) => optionText(option))
                .join(", ")
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
