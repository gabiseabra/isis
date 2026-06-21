import type { Meta, StoryObj } from "@storybook/react";
import { Span, Text } from "../display/Text";
import { Card, type CardProps } from "./Card";
import { Table } from "./Table";

type CardStoryArgs = Pick<CardProps, "elevation">;

const elevations = [0, 1, 2] as const;

const meta = {
  title: "Layout/Card",
  args: {
    elevation: 1,
  },
  argTypes: {
    elevation: {
      control: "select",
      options: elevations,
    },
  },
} satisfies Meta<CardStoryArgs>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Default: Story = {
  render: (args) => (
    <Card {...args} p={3} gap={1} style={{ width: 240 }}>
      <Text size="h5">Card</Text>
      <Text color="muted">Elevation controls shadow and border radius.</Text>
    </Card>
  ),
};

export const Elevations: Story = {
  parameters: {
    controls: {
      exclude: ["elevation"],
    },
  },
  render: (args) => (
    <Table
      variant="unstyled"
      gap={2}
      render={(data) => data}
      renderIndex={(_item, index) => (
        <Table.Label align="end">{index}</Table.Label>
      )}
      columns={[{ key: "element" }]}
      rows={([0, 1, 2] as const).map((elevation) => ({
        element: (
          <Card key={elevation} {...args} elevation={elevation} p={3} gap={1}>
            <Text size="h5">Elevation {elevation}</Text>
            <Text color="muted">More elevation, more shadow and radius.</Text>
          </Card>
        ),
      }))}
    />
  ),
};
