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
} satisfies Meta<CheckboxStoryArgs>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Default: Story = {
  render: (args) => <Checkbox {...args} />,
};
