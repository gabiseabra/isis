import { ComponentProps, ReactNode } from "react";
import { Span, Text, TextProps } from "../display/Text";
import * as css from "../utils/css";
import { Slot } from "../utils/slot";
import { Resizable } from "./Resizable";
import styles from "./Table.module.scss";

type ID = string | number;

type Table<Row, Col> = {
  rows: readonly Row[];
  columns: readonly Col[];
};

export type TableProps<Row, Col> = ComponentProps<"table"> & {
  // data
  rows: Row[] | readonly Row[];
  columns: Col[] | readonly Col[];
  getId?: (row: Row, index: number) => ID;

  // variants
  variant?: "default" | "unstyled";
  gap?: number;
  colGap?: number;
  rowGap?: number;

  // slots
  emptyState?: Slot<(table: Table<Row, Col>) => ReactNode>;
  thead?: Slot<(table: Table<Row, Col>) => ReactNode>;
  tfoot?: Slot<(table: Table<Row, Col>) => ReactNode>;
  header?: Slot<(table: Table<Row, Col>) => ReactNode>;
  headerCell?: Slot<(col: Col, table: Table<Row, Col>) => ReactNode>;
  footer?: Slot<(table: Table<Row, Col>) => ReactNode>;
  cell: Slot<(row: Row, col: Col, table: Table<Row, Col>) => ReactNode>;
  index?: Slot<(row: Row, index: number, table: Table<Row, Col>) => ReactNode>;
};

export function Table<Row, Col extends ID>({
  rows,
  columns,
  getId = (_, index) => index,

  variant = "default",
  gap,
  colGap = gap,
  rowGap = gap,

  emptyState,
  thead,
  tfoot,
  header,
  headerCell,
  footer,
  cell,
  index,

  className,
  style,
  ...props
}: TableProps<Row, Col>) {
  const table = { rows, columns };

  const colSpan = columns.length + (index ? 1 : 0);

  return (
    <table
      data-variant={variant}
      data-empty={rows.length === 0 ? true : undefined}
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
      {(thead || header || headerCell) && (
        <thead>
          {Slot.render(thead, table)}

          {header && (
            <Table.Row>
              <Table.Cell as="th" colSpan={colSpan}>
                {Slot.render(header, table)}
              </Table.Cell>
            </Table.Row>
          )}

          {headerCell && (
            <Table.Header
              table={table}
              cell={(col) => Slot.render(headerCell, col, table)}
              left={index && <Table.Cell as="th" data-index />}
            />
          )}
        </thead>
      )}

      <tbody>
        {table.rows.length === 0 && emptyState ? (
          <Table.Row>
            <Table.Cell as="td" colSpan={colSpan}>
              {Slot.render(emptyState, table)}
            </Table.Cell>
          </Table.Row>
        ) : (
          table.rows.map((row, i) => {
            return (
              <Table.Row key={getId(row, i)}>
                {index && (
                  <Table.Cell as="th" data-index>
                    {Slot.render(index, row, i, table)}
                  </Table.Cell>
                )}
                {table.columns.map((col) => (
                  <Table.Cell key={col}>
                    {Slot.render(cell, row, col, table)}
                  </Table.Cell>
                ))}
              </Table.Row>
            );
          })
        )}
      </tbody>

      {(tfoot || footer) && (
        <tfoot>
          {Slot.render(tfoot, table)}

          {footer && (
            <Table.Row>
              <Table.Cell as="td" colSpan={colSpan}>
                {Slot.render(footer, table)}
              </Table.Cell>
            </Table.Row>
          )}
        </tfoot>
      )}
    </table>
  );
}

export type TableCellProps = ComponentProps<"td"> & {
  as?: "td" | "th";
};
Table.Cell = function TableCell({
  as: Component = "td",
  ...props
}: TableCellProps) {
  return <Component {...props} />;
};

export type TableRowProps = ComponentProps<"tr">;

Table.Row = function TableRow(props: TableRowProps) {
  return <tr {...props} />;
};

Table.Label = function TableLabel({ children, ...props }: TextProps) {
  return (
    <Text size="caption" font="sans-serif" color="muted" {...props}>
      {children}
    </Text>
  );
};

export type TableHeaderProps<Row, Col> = Omit<
  ComponentProps<"tr">,
  "children"
> & {
  table: Table<Row, Col>;
  cell?: Slot<(col: Col) => ReactNode>;
  left?: ReactNode;
  right?: ReactNode;
};

Table.Header = function TableHeader<Row, Col extends ID>({
  table,
  left,
  right,
  cell = (col) => <Table.Label>{col}</Table.Label>,
  className,
  ...props
}: TableHeaderProps<Row, Col>) {
  return (
    <Table.Row
      className={[styles.ColHeader, className].filter(Boolean).join(" ")}
      {...props}
    >
      {left}
      {table.columns.map((col) => (
        <Table.Cell as="th" key={col}>
          {Slot.render(cell, col)}
        </Table.Cell>
      ))}
      {right}
    </Table.Row>
  );
};

export type ResizableTableHeaderProps<Row, Col> = TableHeaderProps<Row, Col> & {
  columns: { key: Col; width?: number }[];
  onResize: (col: Col, width: number) => void;
};

Table.ResizableHeader = function ResizableTableHeader<Row, Col extends string>({
  table,
  cell = (col) => <Table.Label>{col}</Table.Label>,
  columns: resizableColumns,
  onResize,
  left,
  right,
  className,
  ...props
}: ResizableTableHeaderProps<Row, Col>) {
  return (
    <Table.Row
      className={[styles.ColHeader, className].filter(Boolean).join(" ")}
      {...props}
    >
      {left}
      {table.columns.map((col) => {
        const resizable = resizableColumns.find(({ key }) => key === col);
        return (
          <Resizable
            asChild
            disabled={!resizable}
            direction="x"
            onResize={(width) => onResize?.(col, width)}
          >
            <Table.Cell
              as="th"
              key={col}
              style={{
                position: "relative",
                width: resizable?.width,
              }}
            >
              {Slot.render(cell, col)}
            </Table.Cell>
          </Resizable>
        );
      })}
      {right}
    </Table.Row>
  );
};
