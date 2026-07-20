import { ComponentProps, DragEvent, ReactNode, useState } from "react";
import { FiUploadCloud } from "react-icons/fi";
import { Text } from "../display/Text";
import { Field, FieldProps } from "./Field";
import styles from "./FileUpload.module.scss";
import { BaseInputProps } from "./use-form";

export type FileUploadProps = Omit<
  ComponentProps<"input">,
  "multiple" | "size" | "title" | "type" | "value"
> & {
  size?: "m" | "l";
  title?: ReactNode;
  placeholder?: ReactNode;
  fieldProps?: FieldProps;
} & (
    | ({ multiple?: false } & BaseInputProps<File | undefined>)
    | ({ multiple: true } & BaseInputProps<File[]>)
  );

export function FileUpload({
  size = "l",
  title,
  placeholder = "Nenhum arquivo selecionado",
  className,
  disabled,
  multiple,
  required,
  value,
  onChange,
  onChangeValue,
  touched,
  onTouch,
  label,
  description,
  error,
  fieldProps,
  ...props
}: FileUploadProps) {
  const [dragging, setDragging] = useState(false);
  const selectedFiles = multiple ? (value ?? []) : value ? [value] : [];

  const changeFiles = (files: FileList | File[]) => {
    const nextFiles = Array.from(files);

    if (multiple) onChangeValue?.(nextFiles);
    else onChangeValue?.(nextFiles[0]);
  };

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);

    if (disabled) return;

    changeFiles(event.dataTransfer.files);
    onTouch?.();
  };

  return (
    <Field
      htmlFor={props.id}
      {...{ label, description, error, required }}
      {...fieldProps}
    >
      <label
        className={[styles.FileUpload, className].filter(Boolean).join(" ")}
        data-dragging={dragging || undefined}
        data-disabled={disabled || undefined}
        data-size={size}
        onDragEnter={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragging(false);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={onDrop}
      >
        <input
          {...props}
          className={styles.Input}
          data-touched={touched || undefined}
          disabled={disabled}
          multiple={multiple}
          required={required}
          type="file"
          onBlur={(event) => {
            props.onBlur?.(event);
            onTouch?.();
          }}
          onChange={(event) => {
            onChange?.(event);
            changeFiles(event.currentTarget.files ?? []);
            event.currentTarget.value = "";
          }}
        />

        <FiUploadCloud className={styles.Icon} />

        {size === "l" && title && <Text align="center">{title}</Text>}

        <Text
          as="div"
          size={size === "l" ? "caption" : "body"}
          color="muted"
          align={size === "l" ? "center" : "left"}
          className={styles.Text}
        >
          {selectedFiles.length
            ? selectedFiles.map((file) => file.name).join(", ")
            : placeholder}
        </Text>
      </label>
    </Field>
  );
}
