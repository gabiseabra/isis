import { extractDeclaration } from "@isis/common/utils/source-code";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Autocomplete, AutocompleteProps } from "./Autocomplete";
import ownSource from "./Autocomplete.stories?raw";

const demoOptions = [
  { value: "first", textValue: "First option" },
  { value: "second", textValue: "Second option" },
  { value: "third", textValue: "Third option" },
  { value: "four", textValue: "Fourth option" },
];

type DemoOption = (typeof demoOptions)[number];

type AutocompleteStoryProps = Pick<
  AutocompleteProps<DemoOption["value"], DemoOption, never>,
  "disabled" | "placeholder"
>;

const meta: Meta<AutocompleteStoryProps> = {
  title: "Form/Autocomplete",
  args: {
    placeholder: "Search option",
    disabled: false,
  },
};

type Story = StoryObj<AutocompleteStoryProps>;

export default meta;

function AutocompleteStory(props: AutocompleteStoryProps) {
  const [value, setValue] = useState("fisrt");

  return (
    <Autocomplete
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
  render: (props) => <AutocompleteStory {...props} />,
};

function MultiAutocompleStory(props: AutocompleteStoryProps) {
  const [values, setValues] = useState<string[]>([]);
  return (
    <Autocomplete
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
  parameters: {
    docs: {
      source: {
        code: extractDeclaration(ownSource, "function", "MultiAutocompleStory"),
        language: "jsx",
      },
    },
  },
  render: (props) => <MultiAutocompleStory {...props} />,
};
