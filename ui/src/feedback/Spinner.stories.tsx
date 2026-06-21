import type { Meta, StoryObj } from "@storybook/react";
import { Row } from "../layout/FlexBox";
import { Spinner, type SpinnerProps } from "./Spinner";

type SpinnerStoryProps = Pick<SpinnerProps, "size">;

const spinnerSizes = ["s", "m", "l"] as const;

const meta: Meta<SpinnerStoryProps> = {
  title: "Feedback/Spinner",
  args: {
    size: "m",
  },
  argTypes: {
    size: {
      control: "select",
      options: spinnerSizes,
    },
  },
};

type Story = StoryObj<SpinnerStoryProps>;

export default meta;

export const Default: Story = {
  render: (props) => <Spinner {...props} />,
};

export const Sizes: Story = {
  parameters: {
    controls: {
      exclude: ["size"],
    },
  },
  render: (props) => (
    <Row gap={2}>
      {spinnerSizes.map((size) => (
        <Spinner key={size} {...props} size={size} />
      ))}
    </Row>
  ),
};
