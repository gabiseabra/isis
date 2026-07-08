import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { DateInput, type DateInputProps } from "./DateInput";

type DateInputStoryArgs = Pick<
  DateInputProps,
  "closeOnSelect" | "disabled" | "placeholder" | "size" | "variant"
>;

const meta = {
  title: "Form/DateInput",
  args: {
    size: "m",
    placeholder: "Selecione uma data",
    disabled: false,
    closeOnSelect: false,
    variant: "default",
  },
  render: (args) => <DateInputStory {...args} />,
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
} satisfies Meta<DateInputStoryArgs>;

type Story = StoryObj<typeof meta>;

export default meta;

function DateInputStory(props: DateInputStoryArgs) {
  const [value, setValue] = useState<Date>();

  return <DateInput {...props} value={value} onChangeValue={setValue} />;
}

export const Default: Story = {};
