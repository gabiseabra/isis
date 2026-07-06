import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Card } from "../layout/Card";
import { Select, type SelectProps } from "./Select";

const demoOptions = [
  { value: "first", textValue: "First option" },
  { value: "second", textValue: "Second option" },
  { value: "third", textValue: "Third option" },
  { value: "four", textValue: "Fourth option" },
];

type DemoOption = (typeof demoOptions)[number];

type SelectStoryProps = Pick<
  SelectProps<DemoOption["value"], DemoOption, never>,
  "disabled" | "placeholder" | "variant"
>;

const meta: Meta<SelectStoryProps> = {
  title: "Form/Select",
  args: {
    placeholder: "Select option",
    disabled: false,
    variant: "default",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "unstyled"],
    },
  },
};

type Story = StoryObj<SelectStoryProps>;

export default meta;

function SelectStory(props: SelectStoryProps) {
  const [value, setValue] = useState("fisrt");
  return (
    <Select
      {...props}
      autoFocus
      options={demoOptions}
      optionText={(option) => option.textValue}
      optionId={(option) => option.value}
      value={value}
      onChangeValue={setValue}
    />
  );
}

export const Default: Story = {
  render: (props) => <SelectStory {...props} />,
};

function MultiSelectStory(props: SelectStoryProps) {
  const [values, setValues] = useState<string[]>([]);
  return (
    <Select
      {...props}
      autoFocus
      options={demoOptions}
      optionText={(option) => option.textValue}
      optionId={(option) => option.value}
      multiple
      value={values}
      onChangeValue={setValues}
    />
  );
}

export const Multiple: Story = {
  render: (props) => <MultiSelectStory {...props} />,
};

export const Bounded: Story = {
  render: (props) => (
    <Select.Boundary padding={2} asChild>
      <Card elevation={1} px={10} py={20} alignX="center" alignY="center">
        <MultiSelectStory {...props} />
      </Card>
    </Select.Boundary>
  ),
};
