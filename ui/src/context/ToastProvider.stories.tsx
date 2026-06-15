import type { Meta, StoryObj } from "@storybook/react";
import { Button, type ButtonProps } from "../form/Button";
import { Col, Row } from "../layout/FlexBox";
import { ToastProvider, type ToastType, useToast } from "./ToastProvider";

type ToastStoryArgs = {
  type: ToastType;
  title: string;
  message: string;
  duration: number;
};

const toastTypes = ["neutral", "success", "warning", "error"] as const;
const toastButtonColors: Record<
  ToastType,
  NonNullable<ButtonProps["color"]>
> = {
  neutral: "gray",
  success: "green",
  warning: "yellow",
  error: "red",
};

const meta = {
  title: "Context/ToastProvider",
  args: {
    type: "neutral",
    title: "Toast title",
    message: "Toast message",
    duration: 5000,
  },
  render: (args) => <ToastTrigger {...args} />,
  argTypes: {
    type: {
      control: "select",
      options: toastTypes,
    },
  },
  decorators: [
    (Story) => (
      <ToastProvider>
        <Col p={4} gap={1}>
          <Story />
        </Col>
      </ToastProvider>
    ),
  ],
} satisfies Meta<ToastStoryArgs>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Default: Story = {};

export const Types: Story = {
  parameters: {
    controls: {
      exclude: ["type"],
    },
  },
  render: (args) => (
    <Row gap={1} wrap>
      {toastTypes.map((type) => (
        <ToastTrigger key={type} {...args} type={type} />
      ))}
    </Row>
  ),
};

function ToastTrigger({ type, title, message, duration }: ToastStoryArgs) {
  const toast = useToast();

  return (
    <Button
      color={toastButtonColors[type]}
      onClick={() =>
        toast.show({
          type,
          title,
          message,
          duration,
        })
      }
    >
      Show {type} toast
    </Button>
  );
}
