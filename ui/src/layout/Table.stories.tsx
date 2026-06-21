import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Badge } from "../display/Badge";
import { Text } from "../display/Text";
import { Table, type TableProps } from "./Table";

type TableStoryItem = {
  name: string;
  email: string;
  role: string;
};

type TableStoryProps = TableProps<TableStoryItem>;

const columns: TableStoryProps["columns"] = [
  { key: "email", title: "Email" },
  { key: "name", title: "Name" },
  { key: "role", title: "Role" },
];

const data: TableStoryProps["rows"] = [
  { name: "Ada Lovelace", email: "ada@example.com", role: "Admin" },
  { name: "Grace Hopper", email: "grace@example.com", role: "Editor" },
  { name: "Katherine Johnson", email: "katherine@example.com", role: "Viewer" },
];

const renderDemo = (item: TableStoryItem) => ({
  name: <Text>{item.name}</Text>,
  email: <Text>{item.email}</Text>,
  role: (
    <Badge color="blue" size="m">
      {item.role}
    </Badge>
  ),
});

const meta: Meta<TableStoryProps> = {
  title: "Layout/Table",
};

type Story = StoryObj<TableStoryProps>;

export default meta;

export const Default: Story = {
  render: () => <Table columns={columns} rows={data} render={renderDemo} />,
};

export const WithHeader: Story = {
  render: () => (
    <Table
      columns={columns}
      rows={data}
      render={renderDemo}
      header={<Table.Header />}
    />
  ),
};

function TableWithResizableHeaderStory() {
  const [columnsState, setColumnsState] = useState(columns);
  return (
    <Table
      columns={columnsState}
      rows={data}
      render={renderDemo}
      header={
        <Table.Header
          resizable={["name", "email"]}
          onResize={(key, width) =>
            setColumnsState(
              columnsState.map((column) => ({
                ...column,
                width: column.key === key ? width : column.width,
              })),
            )
          }
        />
      }
    />
  );
}

export const WithResizableHeader: Story = {
  render: () => <TableWithResizableHeaderStory />,
};
