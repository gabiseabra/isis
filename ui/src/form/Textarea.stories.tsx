import type { Meta, StoryObj } from "@storybook/react";
import { Col } from "../layout/FlexBox";
import { Textarea, type TextareaProps } from "./Textarea";

type TextareaStoryArgs = Pick<
  TextareaProps,
  "placeholder" | "rows" | "autoGrow" | "disabled" | "variant"
>;

const meta = {
  title: "Form/Textarea",
  args: {
    placeholder: "Textarea",
    rows: 4,
    autoGrow: false,
    disabled: false,
    variant: "default",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "unstyled"],
    },
  },
} satisfies Meta<TextareaStoryArgs>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Default: Story = {
  render: (args) => <Textarea {...args} />,
};

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
  render: (args) => <Textarea {...args} />,
};
