import type { Meta, StoryObj } from "@storybook/react";
import { Col } from "../layout/FlexBox";
import { Field, type FieldProps } from "./Field";
import { Input } from "./Input";

type FieldStoryArgs = Pick<FieldProps, "label" | "description" | "error">;

const meta = {
  title: "Form/Field",
  args: {
    label: "Label",
  },
  render: (args) => (
    <Field name="field" {...args}>
      <Input placeholder="Input" />
    </Field>
  ),
  parameters: {
    controls: {
      include: ["label", "description", "error"],
    },
  },
  decorators: [
    (Story) => (
      <Col p={4} gap={1}>
        <Story />
      </Col>
    ),
  ],
} satisfies Meta<FieldStoryArgs>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Default: Story = {};

export const WithDescription: Story = {
  args: {
    description: "Description",
  },
};

export const WithError: Story = {
  args: {
    error: "Error",
  },
};
