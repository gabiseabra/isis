import { hash } from "@isis/common/utils/hash";
import { keys } from "@isis/common/utils/object";
import {
  ReactNode,
  SubmitEvent,
  useCallback,
  useId,
  useMemo,
  useState,
} from "react";
import z, { ZodError } from "zod";

type AnySchema = { [k: string]: z.ZodType };

export type UseFormOptions<T extends AnySchema> = {
  schema: z.ZodObject<T>;
  initialValue: Partial<FormValue<T>>;
  onSubmit(value: z.infer<z.ZodObject<T>>): void;
};

export type BaseInputProps<T> = {
  id: string;
  label?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;

  required: boolean;
  value?: T;
  onChangeValue(value: T): void;

  touched: boolean;
  onTouch(): void;
};

export type Form<T extends AnySchema> = {
  errors: Map<keyof T, ZodError>;
  touched: Set<keyof T>;
  submit(e: SubmitEvent): void;
  reset(): void;
  register<K extends keyof T>(field: K): BaseInputProps<FormValue<T>[K]>;
  setValue<K extends keyof T>(field: K, value: FormValue<T>[K]): void;
  getValue<K extends keyof T>(field: K): FormValue<T>[K] | undefined;
  hasUnsavedChanges: boolean;
};

type FormValue<T extends AnySchema> = {
  [k in keyof T]: z.infer<T[k]>;
};

export function useForm<T extends AnySchema>({
  schema,
  initialValue,
  onSubmit,
}: UseFormOptions<T>): Form<T> {
  const id = useId();
  const [values, setValues] = useState(initialValue);
  const [errors, setErrors] = useState<Map<keyof FormValue<T>, ZodError>>(
    new Map(),
  );
  const [touched, setTouched] = useState<Set<keyof FormValue<T>>>(new Set());

  const submit = useCallback(
    (e: SubmitEvent) => {
      e.preventDefault();

      const value = schema.safeParse(values);

      if (value.success) onSubmit(value.data);
    },
    [values, schema],
  );

  const reset = useCallback(() => {
    setValues(initialValue);
    setErrors(new Map());
    setTouched(new Set());
  }, [initialValue]);

  const setValue = useCallback(
    <K extends keyof T>(field: K, value: FormValue<T>[K]) => {
      setValues((values) => ({ ...values, [field]: value }));
    },
    [],
  );

  const getValue = useCallback(
    <K extends keyof T>(field: K): FormValue<T>[K] | undefined => values[field],
    [values],
  );

  const validate = <K extends keyof T>(field: K) => {
    const result = schema.shape[field].safeParse(values[field]);
    if (result.error) {
      setErrors((errors) => {
        errors.set(field, result.error);
        return new Map(Array.from(errors.entries()));
      });
    }
  };

  const register = <K extends keyof T>(field: K) => ({
    id: `${id}-${String(field)}`,
    value: values[field],
    onChangeValue: (value: FormValue<T>[K]) => setValue(field, value),
    required: schema.shape[field]._zod.optin !== "optional",
    error: errors.has(field) ? z.prettifyError(errors.get(field)!) : undefined,
    touched: touched.has(field),
    onTouch: () => {
      validate(field);
      setTouched((touched) => new Set([...Array.from(touched), field]));
    },
  });

  const hasUnsavedChanges = useMemo(() => {
    return keys(schema.shape).some(
      (k) => hash(values[k]) !== hash(initialValue[k]),
    );
  }, [values]);

  return {
    errors,
    touched,
    submit,
    reset,
    register,
    setValue,
    getValue,
    hasUnsavedChanges,
  };
}
