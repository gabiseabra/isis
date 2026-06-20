import { DistributiveOmit } from "@isis/common/types/union";
import { escapeRegExp } from "@isis/common/utils/regexp";
import {
  createContext,
  KeyboardEvent,
  useContext,
  useRef,
  useState,
} from "react";
import styles from "./Autocomplete.module.scss";
import {
  Select,
  SelectItemProps,
  SelectOption,
  SelectProps,
  useSelectOption,
} from "./Select";

const AutocompleteContext = createContext<{
  isVisible(option: SelectOption): boolean;
}>({
  isVisible() {
    return false;
  },
});

export function useAutocomplete() {
  return useContext(AutocompleteContext);
}

export type AutocompleteProps = DistributiveOmit<SelectProps, "trigger"> & {
  setQueryOnSelect?: boolean;
} & (
    | {
        multiple?: false;
        getLabel?(value: string): string;
      }
    | {
        multiple: true;
        getLabel?(value: string[]): string;
      }
  );

export function Autocomplete({
  placeholder,
  open: controlledOpen,
  onOpenChange: onControlledOpenChange,
  ...props
}: AutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localOpen, setLocalOpen] = useState(false);
  const [query, setQuery] = useState("");

  const queryRegExp = query && new RegExp(escapeRegExp(query));

  const label = (() => {
    if (props.getLabel && props.value)
      return (
        // 🙃
        props.multiple
          ? props.getLabel(props.value)
          : props.getLabel(props.value)
      );
    return "";
  })();

  return (
    <AutocompleteContext.Provider
      value={{
        isVisible(option) {
          return (
            !queryRegExp || queryRegExp.test(option.textValue ?? option.value)
          );
        },
      }}
    >
      <Select
        trigger={
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query || label}
            onChange={(e) => setQuery(e.currentTarget.value)}
            className={styles.Input}
          />
        }
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
    </AutocompleteContext.Provider>
  );
}

export type AutocompleteItemProps = SelectItemProps;

Autocomplete.Item = function AutocompleteItem(props: AutocompleteItemProps) {
  const autocomplete = useAutocomplete();
  const option = useSelectOption(props);

  if (!autocomplete.isVisible(option)) return null;

  return <Select.Item {...props} />;
};
