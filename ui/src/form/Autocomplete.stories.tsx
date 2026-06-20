import { hasPropertyValue } from "@isis/common/utils/guards";
import type { Meta, StoryObj } from "@storybook/react";
import { useRef, useState } from "react";
import { Autocomplete, AutocompleteProps } from "./Autocomplete";
import { Select } from "./Select";

type AutocompleteStoryProps = Pick<
  AutocompleteProps,
  "disabled" | "placeholder"
>;

const DemoOptions = () =>
  [
    { value: "first", textValue: "First option" },
    { value: "second", textValue: "Second option" },
    { value: "third", textValue: "Third option" },
    { value: "four", textValue: "Fourth option" },
  ].map((option) => (
    <Autocomplete.Item key={option.value} {...option}>
      {option.textValue}
    </Autocomplete.Item>
  ));

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
  const selectRef = useRef<Select>(null);

  return (
    <Autocomplete
      ref={selectRef}
      {...props}
      value={value}
      onValueChange={setValue}
      getLabel={(value) =>
        selectRef.current?.options.find(hasPropertyValue("value", value))
          ?.textValue ?? ""
      }
    >
      <DemoOptions />
    </Autocomplete>
  );
}

export const Default: Story = {
  render: (props) => <AutocompleteStory {...props} />,
};

function MultiAutocompleStory(props: AutocompleteStoryProps) {
  const [values, setValues] = useState<string[]>([]);
  return (
    <Autocomplete {...props} multiple value={values} onValueChange={setValues}>
      <DemoOptions />
    </Autocomplete>
  );
}

export const Multiple: Story = {
  render: (props) => <MultiAutocompleStory {...props} />,
};
