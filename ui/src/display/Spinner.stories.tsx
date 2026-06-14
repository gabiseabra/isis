import type { Meta, StoryObj } from "@storybook/react";
import { Row } from "../layout/FlexBox";
import { Spinner, type SpinnerProps } from "./Spinner";

type SpinnerStoryArgs = Pick<SpinnerProps, "size">;

const meta = {
  title: "Display/Spinner",
  args: {
    size: "m",
  },
  render: (args) => <Spinner {...args} />,
  argTypes: {
    size: {
      control: "select",
      options: ["s", "m", "l"],
    },
  },
  parameters: {
    controls: {
      include: ["size"],
    },
  },
  decorators: [
    (Story) => (
      <Row p={4} gap={1}>
        <Story />
      </Row>
    ),
  ],
} satisfies Meta<SpinnerStoryArgs>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Default: Story = {};

export const Sizes: Story = {
  parameters: {
    controls: {
      include: [],
    },
  },
  render: (args) => (
    <>
      {(["s", "m", "l"] as const).map((size) => (
        <Spinner key={size} {...args} size={size} />
      ))}
    </>
  ),
};
