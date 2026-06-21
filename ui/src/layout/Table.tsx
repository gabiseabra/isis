import { keys } from "@isis/common/utils/object";
import {
  ComponentProps,
  ComponentType,
  createContext,
  ReactNode,
  useContext,
  useMemo,
} from "react";
import { Span, Text, TextProps } from "../display/Text";
import * as css from "../utils/css";
import { Resizable } from "./Resizable";
import styles from "./Table.module.scss";

type Key = string | number;
type Row = { [k in Key]: unknown };
type Col<K extends Key> = {
  key: K;
  title?: string;
  width?: number;
};
type Table<T extends Row> = {
  rows: T[];
  columns: Col<Extract<keyof T, Key>>[];
  indexed: boolean;
};

const TableContext = createContext<Table<Row>>({
  rows: [],
  columns: [],
  indexed: false,
});

function useTable() {
  return useContext(TableContext);
}

export type TableProps<T extends Row> = ComponentProps<"table"> & {
  variant?: "default" | "unstyled";
  rows: T[];
  columns: Col<Extract<keyof T, Key>>[];
  header?: ReactNode | ((table: Table<T>) => ReactNode);
  footer?: ReactNode | ((table: Table<T>) => ReactNode);
  render: (
    item: T,
    index: number,
    table: Table<T>,
  ) => Record<keyof T, ReactNode>;
  renderIndex?: (item: T, index: number, table: Table<T>) => ReactNode;
  gap?: number;
  colGap?: number;
  rowGap?: number;
};

export function Table<T extends Row>({
  rows,
  header,
  footer,
  columns,
  render,
  renderIndex,
  variant = "default",
  gap,
  colGap = gap,
  rowGap = gap,
  className,
  style,
  ...props
}: TableProps<T>) {
  const table = useMemo<Table<T>>(
    () => ({
      indexed: !!renderIndex,
      rows,
      columns:
        columns ??
        (() => {
          if (rows[0])
            return keys(rows[0]).map((key) => ({
              key,
            }));
          return [];
        })(),
    }),
    [rows, columns],
  );

  return (
    <TableContext.Provider value={table as Table<Row>}>
      <table
        data-variant={variant}
        className={[styles.Root, className].filter(Boolean).join(" ")}
        style={{
          borderSpacing:
            colGap || rowGap
              ? `${colGap ? css.space(colGap) : "0"} ${rowGap ? css.space(rowGap) : "0"}`
              : undefined,
          ...style,
        }}
        {...props}
      >
        {header instanceof Function ? header(table) : header}
        <tbody>
          {table.rows.map((item, index) => {
            const row = render(item, index, table);
            return (
              <Table.Row key={index}>
                {table.indexed && (
                  <Table.Col style={{ width: "0" }} data-index="true">
                    {renderIndex?.(item, index, table)}
                  </Table.Col>
                )}
                {table.columns.map((col) => (
                  <Table.Col key={col.key}>{row[col.key]}</Table.Col>
                ))}
              </Table.Row>
            );
          })}
        </tbody>
        {footer instanceof Function ? footer(table) : footer}
      </table>
    </TableContext.Provider>
  );
}

export type TableColProps = ComponentProps<"td">;
Table.Col = function TableCol(props: TableColProps) {
  return <td {...props} />;
};

export type TableRowProps = ComponentProps<"tr">;

Table.Row = function TableRow(props: TableRowProps) {
  return <tr {...props} />;
};

export type TableHeaderProps<T extends Row> = Omit<
  ComponentProps<"thead">,
  "children"
> & {
  Label?: ComponentType<{ children: ReactNode }>;
  resizable?: (keyof T)[];
  onResize?: (key: keyof T, width: number) => void;
};

Table.Header = function TableHeader<T extends Row>({
  Label = Table.Label,
  resizable,
  onResize,
  ...props
}: TableHeaderProps<T>) {
  const { columns, indexed } = useTable();

  return (
    <thead {...props}>
      <tr>
        {indexed && <th data-index="true" />}
        {columns.map((col) => {
          const canResize = resizable?.includes(col.key);

          const content = (
            <th
              key={col.key}
              style={{
                "--table-column-width": col.width && `${col.width}px`,
                position: "relative",
                width: col.width,
              }}
            >
              <Label>{col.title}</Label>
            </th>
          );

          if (canResize)
            return (
              <Resizable
                key={col.key}
                asChild
                direction="x"
                onResize={(width) => onResize?.(col.key, width)}
              >
                {content}
              </Resizable>
            );
          return content;
        })}
      </tr>
    </thead>
  );
};

Table.Label = function TableLabel({ children, ...props }: TextProps) {
  return (
    <Text size="caption" font="monospace" color="muted" {...props}>
      <Span bold>{children}</Span>
    </Text>
  );
};
