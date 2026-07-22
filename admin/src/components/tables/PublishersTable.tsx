import { Publisher } from "@isis/common/dto/publisher";
import { unique } from "@isis/common/utils/array";
import { ID } from "@isis/common/utils/id";
import { EmptySearch } from "@isis/ui/feedback/EmptyState";
import { Checkbox } from "@isis/ui/form/Checkbox";
import { Table, TableProps } from "@isis/ui/layout/Table";
import { ReactNode } from "react";

type PublishersTableProps = Omit<
  TableProps<Publisher, keyof Publisher>,
  "columns" | "cell"
> & {
  selectedIds?: Publisher["id"][];
  onChangeSelectedIds?: (row: Publisher["id"][]) => void;
  onSetSelectedIds?: (row: Publisher["id"][]) => void;
  onResetSelectedIds?: () => void;
  errorState?: ReactNode;
};

export function PublishersTable({
  rows,
  selectedIds,
  onChangeSelectedIds,
  onSetSelectedIds,
  onResetSelectedIds,
  errorState,
  ...props
}: PublishersTableProps) {
  return (
    <Table
      rows={errorState ? [] : rows}
      columns={["id", "name", "createdAt", "updatedAt"]}
      headerCell={(col) =>
        ({
          id: "ID",
          name: "Nome",
          createdAt: "Criado",
          updatedAt: "Modificado",
        })[col]
      }
      cell={(row, col) =>
        ({
          id: ID.parse(row.id).id,
          name: row.name,
          createdAt: row.createdAt.toLocaleDateString(),
          updatedAt: row.updatedAt.toLocaleDateString(),
        })[col]
      }
      emptyState={
        errorState ? errorState : <EmptySearch py={4} title="Sem resultados" />
      }
      index={
        selectedIds
          ? (row) => (
              <Checkbox
                value={selectedIds.includes(row.id)}
                onChangeValue={(checked) => {
                  onChangeSelectedIds?.(
                    checked
                      ? unique([...selectedIds, row.id])
                      : (selectedIds?.filter((id) => id !== row.id) ?? []),
                  );
                }}
              />
            )
          : undefined
      }
      indexHeader={
        selectedIds ? (
          <Checkbox
            checked={
              rows.every((row) => selectedIds?.includes(row.id))
                ? true
                : selectedIds.length
                  ? "indeterminate"
                  : false
            }
            value={rows.every((row) => selectedIds.includes(row.id))}
            onChangeValue={(checked) => {
              if (checked) onSetSelectedIds?.(rows.map((row) => row.id));
              else onResetSelectedIds?.();
            }}
          />
        ) : undefined
      }
      {...props}
    />
  );
}
