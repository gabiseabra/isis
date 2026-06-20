import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Card } from "../layout/Card";
import { Select, type SelectProps } from "./Select";

type SelectStoryProps = Pick<SelectProps, "disabled" | "placeholder">;

const DemoOptions = () =>
  [
    { value: "first", textValue: "First option" },
    { value: "second", textValue: "Second option" },
    { value: "third", textValue: "Third option" },
    { value: "four", textValue: "Fourth option" },
  ].map((option) => (
    <Select.Item key={option.value} {...option}>
      {option.textValue}
    </Select.Item>
  ));

const meta: Meta<SelectStoryProps> = {
  title: "Form/Select",
  args: {
    placeholder: "Select option",
    disabled: false,
  },
};

type Story = StoryObj<SelectStoryProps>;

export default meta;

function SelectStory(props: SelectStoryProps) {
  const [value, setValue] = useState("fisrt");
  return (
    <Select {...props} value={value} onValueChange={setValue}>
      <DemoOptions />
    </Select>
  );
}

export const Default: Story = {
  render: (props) => <SelectStory {...props} />,
};

function MultiSelectStory(props: SelectStoryProps) {
  const [values, setValues] = useState<string[]>([]);
  return (
    <Select {...props} multiple value={values} onValueChange={setValues}>
      <DemoOptions />
    </Select>
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
