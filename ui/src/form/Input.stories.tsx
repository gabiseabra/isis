import type { Meta, StoryObj } from "@storybook/react";
import { Col } from "../layout/FlexBox";
import { Input, type InputProps } from "./Input";

type InputStoryArgs = Pick<InputProps, "placeholder" | "type" | "disabled">;

const meta = {
  title: "Form/Input",
  args: {
    placeholder: "Input",
    type: "text",
    disabled: false,
  },
  render: (args) => <Input {...args} />,
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "search"],
    },
  },
  decorators: [
    (Story) => (
      <Col p={4} gap={1}>
        <Story />
      </Col>
    ),
  ],
} satisfies Meta<InputStoryArgs>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Default: Story = {};

export const WithSlots: Story = {
  render: (args) => <Input {...args} left="left" right="right" />,
};
