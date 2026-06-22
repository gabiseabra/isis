import { createRecord } from "@isis/common/utils/object";
import type { Meta, StoryObj } from "@storybook/react";
import { Table } from "../layout/Table";
import { Spinner, type SpinnerProps } from "./Spinner";

type SpinnerStoryProps = Pick<SpinnerProps, "size">;

const spinnerSizes = ["s", "m", "l"] as const;

const meta: Meta<SpinnerStoryProps> = {
  title: "Feedback/Spinner",
  args: {
    size: "m",
  },
  argTypes: {
    size: {
      control: "select",
      options: spinnerSizes,
    },
  },
};

type Story = StoryObj<SpinnerStoryProps>;

export default meta;

export const Default: Story = {
  render: (props) => <Spinner {...props} />,
};

export const Sizes: Story = {
  parameters: {
    controls: {
      exclude: ["size"],
    },
  },
  render: (props) => (
    <Table
      variant="unstyled"
      gap={2}
      columns={spinnerSizes}
      rows={[
        createRecord(spinnerSizes, (size) => (
          <Spinner key={size} {...props} size={size} />
        )),
      ]}
      cell={(row, col) => row[col]}
      headerCell={(col) => <Table.Label>{col}</Table.Label>}
    />
  ),
};
