import { DateRange } from "@isis/common/dto/date-range";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { DateRangeInput, type DateRangeInputProps } from "./DateRangeInput";

type DateRangeInputStoryArgs = Pick<
  DateRangeInputProps,
  "closeOnSelect" | "disabled" | "placeholder" | "size" | "variant"
>;

const meta = {
  title: "Form/DateRangeInput",
  args: {
    size: "m",
    placeholder: "Selecione um período",
    disabled: false,
    closeOnSelect: false,
    variant: "default",
  },
  argTypes: {
    size: {
      control: "select",
      options: ["s", "m", "l"],
    },
    variant: {
      control: "select",
      options: ["default", "unstyled"],
    },
  },
} satisfies Meta<DateRangeInputStoryArgs>;

type Story = StoryObj<typeof meta>;

export default meta;

function DateRangeInputStory(props: DateRangeInputStoryArgs) {
  const [value, setValue] = useState<DateRange>();

  return <DateRangeInput {...props} value={value} onChangeValue={setValue} />;
}

export const Default: Story = {
  render: (args) => <DateRangeInputStory {...args} />,
};
