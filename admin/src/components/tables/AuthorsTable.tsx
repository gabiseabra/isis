import { Author } from "@isis/common/dto/author";
import { unique } from "@isis/common/utils/array";
import { ID } from "@isis/common/utils/id";
import { EmptyState } from "@isis/ui/feedback/EmptyState";
import { Checkbox } from "@isis/ui/form/Checkbox";
import { Table, TableProps } from "@isis/ui/layout/Table";
import { TbListSearch } from "react-icons/tb";

type AuthorsTableProps = Omit<
  TableProps<Author, keyof Author>,
  "columns" | "cell"
> & {
  selectedIds?: Author["id"][];
  onChangeSelectedIds?: (row: Author["id"][]) => void;
  onSetSelectedIds?: (row: Author["id"][]) => void;
  onResetSelectedIds?: () => void;
};

export function AuthorsTable({
  rows,
  selectedIds,
  onChangeSelectedIds,
  onSetSelectedIds,
  onResetSelectedIds,
  ...props
}: AuthorsTableProps) {
  return (
    <Table
      rows={rows}
      columns={[
        "id",
        "name",
        "birthYear",
        "deathYear",
        "createdAt",
        "updatedAt",
      ]}
      headerCell={(col) =>
        ({
          id: "ID",
          name: "Nome",
          birthYear: "Nascimento",
          deathYear: "Morte",
          createdAt: "Criado",
          updatedAt: "Modificado",
        })[col]
      }
      cell={(row, col) =>
        ({
          id: ID.parse(row.id).id,
          name: row.name,
          birthYear: row.birthYear ?? "—",
          deathYear: row.deathYear ?? "—",
          createdAt: row.createdAt.toLocaleDateString(),
          updatedAt: row.updatedAt.toLocaleDateString(),
        })[col]
      }
      emptyState={
        <EmptyState
          py={4}
          size="l"
          icon={<TbListSearch />}
          title="Sem resultados"
        />
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
