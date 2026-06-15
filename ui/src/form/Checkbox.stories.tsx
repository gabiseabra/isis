import type { Meta, StoryObj } from "@storybook/react";
import { Col } from "../layout/FlexBox";
import { Checkbox, type CheckboxProps } from "./Checkbox";

type CheckboxStoryArgs = Pick<CheckboxProps, "label" | "checked" | "disabled">;

const meta = {
  title: "Form/Checkbox",
  args: {
    label: "Checkbox",
    checked: false,
    disabled: false,
  },
  render: (args) => <Checkbox {...args} />,
  parameters: {
    controls: {
      include: ["label", "checked", "disabled"],
    },
  },
  decorators: [
    (Story) => (
      <Col p={4} gap={1}>
        <Story />
      </Col>
    ),
  ],
} satisfies Meta<CheckboxStoryArgs>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Default: Story = {};

export const Checked: Story = {
  args: {
    checked: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
