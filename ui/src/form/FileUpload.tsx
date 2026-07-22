import { DistributiveOmit } from "@isis/common/types/union";
import { setPath } from "@isis/common/utils/object";
import { Slot } from "radix-ui";
import { ComponentProps, DragEvent, ReactNode, useState } from "react";
import { LiaCloudUploadAltSolid } from "react-icons/lia";
import { TbExclamationCircle } from "react-icons/tb";
import { IconControl } from "../display/IconControl";
import { Span, Text } from "../display/Text";
import { Spinner } from "../feedback/Spinner";
import { Overlay } from "../overlay/Overlay";
import { Field, FieldProps } from "./Field";
import styles from "./FileUpload.module.scss";
import { BaseInputProps } from "./use-form";

export type FileUploadProps = Omit<
  ComponentProps<"input">,
  "multiple" | "size" | "title" | "type" | "value"
> & {
  size?: "m" | "l";
  title?: ReactNode;
  label?: ReactNode;
  description?: ReactNode;
  placeholder?: ReactNode;
  fieldProps?: FieldProps;
  labelProps?: ComponentProps<"label">;
  loading?: boolean;
} & (
    | ({ multiple?: false } & BaseInputProps<File>)
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
  labelProps,
  children,
  loading,
  ...props
}: FileUploadProps) {
  const [dragging, setDragging] = useState(false);
  const selectedFiles = multiple ? (value ?? []) : value ? [value] : [];

  const changeFiles = (files: FileList | File[]) => {
    const nextFiles = Array.from(files);

    if (multiple) onChangeValue?.(nextFiles);
    else onChangeValue?.(nextFiles[0]);
  };

  return (
    <Field
      htmlFor={props.id}
      {...{ label, description, error, required }}
      {...fieldProps}
      className={[styles.Field, fieldProps?.className]
        .filter(Boolean)
        .join(" ")}
    >
      <label
        {...labelProps}
        className={[styles.FileUpload, labelProps?.className]
          .filter(Boolean)
          .join(" ")}
        data-dragging={dragging || undefined}
        data-disabled={disabled || undefined}
        data-size={size}
        onDragEnter={() => {
          if (!disabled) setDragging(true);
        }}
        onDragLeave={(e) => {
          if (
            !(
              e.relatedTarget &&
              e.relatedTarget instanceof HTMLElement &&
              e.currentTarget.contains(e.relatedTarget)
            )
          )
            setDragging(false);
        }}
        onDragOver={(event) => {
          event.preventDefault();
        }}
        onDrop={(event: DragEvent<HTMLLabelElement>) => {
          event.preventDefault();
          setDragging(false);

          if (disabled) return;

          changeFiles(event.dataTransfer.files);
          onTouch?.();
        }}
      >
        <input
          {...props}
          className={[styles.Input, className].filter(Boolean).join(" ")}
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

        <IconControl
          size={size}
          color={disabled ? "disabled" : "blue"}
          style={{ pointerEvents: "none" }}
          p={loading ? 1 : 0}
        >
          {loading ? (
            <Spinner size={({ m: "s", l: "m" } as const)[size]} color="blue" />
          ) : (
            <LiaCloudUploadAltSolid />
          )}
        </IconControl>

        {size === "l" && title && <Text align="center">{title}</Text>}

        <Text
          as="div"
          noWrap
          size={size === "l" ? "caption" : "body"}
          color="muted"
          align={size === "l" ? "center" : "left"}
        >
          {selectedFiles.length
            ? selectedFiles.map((file) => file.name).join(", ")
            : placeholder}
        </Text>

        {children}
      </label>
    </Field>
  );
}

export function FileUploadOverlay({
  asChild,
  dragging: _dragging,
  fieldProps,
  labelProps,
  description,
  error,
  children,
  width = "fit-content",
  height = "fit-content",
  ...props
}: DistributiveOmit<FileUploadProps, "label"> & {
  asChild?: boolean;
  children?: ReactNode;
  dragging?: boolean;
  width?: number | string;
  height?: number | string;
}) {
  const [dragging, setDragging] = useState(false);
  return (
    <Overlay.Boundary
      asChild={asChild}
      onDragEnter={() => setDragging(true)}
      onDragLeave={(e) => {
        if (
          !(
            e.relatedTarget &&
            e.relatedTarget instanceof HTMLElement &&
            e.currentTarget.contains(e.relatedTarget)
          )
        )
          setDragging(false);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDrop={() => setDragging(false)}
      style={{ width, height }}
    >
      {asChild ? <Slot.Slottable>{children}</Slot.Slottable> : children}

      <Overlay open={dragging}>
        <FileUpload
          fieldProps={setPath(fieldProps ?? {}, "style.height", "100%")}
          labelProps={setPath(labelProps ?? {}, "style", (style) => ({
            height: "100%",
            background: "transparent",
            ...style,
          }))}
          {...props}
        >
          {description && (
            <Text color="muted" size="caption">
              {description}
            </Text>
          )}

          {error && (
            <Text color="red" size="caption">
              <TbExclamationCircle />

              <Span>{error}</Span>
            </Text>
          )}
        </FileUpload>

        <Overlay.Backdrop variant="light" />
      </Overlay>
    </Overlay.Boundary>
  );
}
