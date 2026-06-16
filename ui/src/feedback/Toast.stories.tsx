import type { Meta, StoryObj } from "@storybook/react";
import { ReactNode } from "react";
import { FaHeart } from "react-icons/fa";
import { Button } from "../form/Button";
import { Col, Row } from "../layout/FlexBox";
import { ToastProvider, type ToastType, useToast } from "./Toast";

type ToastStoryArgs = {
  type: ToastType;
  title: string;
  message: string;
  duration: number;
  icon?: ReactNode;
};

const toastTypes = ["neutral", "success", "warning", "error", "info"] as const;
const toastButtonColors = {
  neutral: "gray",
  success: "green",
  warning: "yellow",
  error: "red",
  info: "blue",
} as const;

const meta = {
  title: "Feedback/Toast",
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

export const WithIcon: Story = {
  render: (args) => <ToastTrigger {...args} icon={<FaHeart />} />,
};

function ToastTrigger({
  type,
  title,
  message,
  duration,
  icon,
}: ToastStoryArgs) {
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
          icon,
        })
      }
    >
      Show {type} toast
    </Button>
  );
}
