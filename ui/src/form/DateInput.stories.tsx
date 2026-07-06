import { type DateRange } from "@daypicker/react";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Col } from "../layout/FlexBox";
import { DateInput, type DateInputProps } from "./DateInput";

type DateInputStoryProps = Pick<
  DateInputProps,
  "closeOnSelect" | "disabled" | "placeholder" | "size" | "minWidth"
>;

const meta = {
  title: "Form/DateInput",
  args: {
    size: "m",
    placeholder: "Selecione uma data",
    disabled: false,
    closeOnSelect: false,
  },
  render: (args) => <DateInputStory {...args} />,
  argTypes: {
    size: {
      control: "select",
      options: ["s", "m", "l"],
    },
  },
  decorators: [
    (Story) => (
      <Col p={4} gap={1}>
        <Story />
      </Col>
    ),
  ],
} satisfies Meta<DateInputStoryProps>;

type Story = StoryObj<typeof meta>;

export default meta;

function DateInputStory(props: DateInputStoryProps) {
  const [value, setValue] = useState<Date>();

  return <DateInput {...props} value={value} onChangeValue={setValue} />;
}

export const Default: Story = {};

function DateRangeInputStory(props: DateInputStoryProps) {
  const [value, setValue] = useState<DateRange>();

  return (
    <DateInput {...props} mode="range" value={value} onChangeValue={setValue} />
  );
}

export const Range: Story = {
  render: (args) => <DateRangeInputStory {...args} />,
};
