import type { Meta, StoryObj } from "@storybook/react";
import { useSessionStorage } from "usehooks-ts";
import { Badge } from "../display/Badge";
import { Text } from "../display/Text";
import { Table, type TableProps } from "./Table";

const columns = ["name", "email", "role"] as const;
type Col = (typeof columns)[number];
type Row = { [k in Col]: string } & { id: number };

type TableStoryProps = Pick<
  TableProps<string, Col>,
  "variant" | "gap" | "colGap" | "rowGap"
>;

const rows: Row[] = [
  { id: 1, name: "Ada Lovelace", email: "ada@example.com", role: "Admin" },
  { id: 2, name: "Grace Hopper", email: "grace@example.com", role: "Editor" },
  {
    id: 3,
    name: "Katherine Johnson",
    email: "katherine@example.com",
    role: "Viewer",
  },
];

const demoCell = (item: Row, col: Col) =>
  ({
    name: <Text>{item.name}</Text>,
    email: <Text>{item.email}</Text>,
    role: (
      <Badge color="blue" size="m">
        {item.role}
      </Badge>
    ),
  })[col];

const meta: Meta<TableStoryProps> = {
  title: "Layout/Table",
};

type Story = StoryObj<TableStoryProps>;

export default meta;

export const Default: Story = {
  render: () => (
    <Table
      columns={columns}
      rows={rows}
      getId={(row) => row.id}
      cell={demoCell}
    />
  ),
};

export const WithHeader: Story = {
  render: () => (
    <Table
      columns={columns}
      rows={rows}
      getId={(row) => row.id}
      cell={demoCell}
      headerCell={(col) => <Table.Label>{col}</Table.Label>}
    />
  ),
};

function TableWithResizableHeaderStory() {
  const [columnsState, setColumnsState] = useSessionStorage<
    {
      key: Col;
      width?: number;
    }[]
  >("TableWithResizableHeaderStory9", [{ key: "name" }, { key: "email" }]);
  return (
    <Table
      columns={columns}
      rows={rows}
      cell={demoCell}
      header={(table) => (
        <Table.ResizableHeader
          table={table}
          columns={columnsState}
          onResize={(key, width) =>
            setColumnsState(
              columnsState.map((column) => ({
                ...column,
                width: column.key === key ? width : column.width,
              })),
            )
          }
        />
      )}
    />
  );
}

export const WithResizableHeader: Story = {
  render: () => <TableWithResizableHeaderStory />,
};
