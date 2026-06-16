import type { Meta, StoryObj } from "@storybook/react";
import { Col } from "../layout/FlexBox";
import { Dropdown, DropdownItem, type DropdownProps } from "./Dropdown";

type DropdownStoryArgs = Pick<
  DropdownProps,
  "defaultValue" | "disabled" | "placeholder"
>;

const options = [
  ["first", "First option"],
  ["second", "Second option"],
  ["third", "Third option"],
] as const;

const meta = {
  title: "Form/Dropdown",
  args: {
    placeholder: "Select option",
    disabled: false,
  },
  render: (args) => (
    <Dropdown {...args}>
      {options.map(([value, label]) => (
        <DropdownItem key={value} value={value}>
          {label}
        </DropdownItem>
      ))}
    </Dropdown>
  ),
  decorators: [
    (Story) => (
      <Col p={4} gap={1}>
        <Story />
      </Col>
    ),
  ],
} satisfies Meta<DropdownStoryArgs>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Default: Story = {};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
