import type { Meta, StoryObj } from "@storybook/react";
import { Col } from "../layout/FlexBox";
import { Textarea, type TextareaProps } from "./Textarea";

type TextareaStoryArgs = Pick<
  TextareaProps,
  "placeholder" | "rows" | "autoGrow" | "disabled"
>;

const meta = {
  title: "Form/Textarea",
  args: {
    placeholder: "Textarea",
    rows: 4,
    autoGrow: false,
    disabled: false,
  },
  render: (args) => <Textarea {...args} />,
  decorators: [
    (Story) => (
      <Col p={4} gap={1}>
        <Story />
      </Col>
    ),
  ],
} satisfies Meta<TextareaStoryArgs>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Default: Story = {};

export const AutoGrow: Story = {
  args: {
    autoGrow: true,
    rows: 1,
  },
  parameters: {
    controls: {
      exclude: ["autoGrow"],
    },
  },
};
