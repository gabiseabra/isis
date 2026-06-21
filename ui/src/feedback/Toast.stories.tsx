import type { Meta, StoryObj } from "@storybook/react";
import { FaHeart } from "react-icons/fa";
import { Button } from "../form/Button";
import { Row } from "../layout/FlexBox";
import { ToastProvider, useToast, type ToastProps } from "./Toast";

type ToastStoryProps = Pick<ToastProps, "type" | "title" | "duration"> & {
  message: string;
};

const toastTypes = ["neutral", "success", "warning", "error", "info"] as const;

const toastButtonColors = {
  neutral: "gray",
  success: "green",
  warning: "yellow",
  error: "red",
  info: "blue",
} as const;

function ToastTrigger({
  type,
  title,
  message,
  duration,
  icon,
}: ToastStoryProps & Pick<ToastProps, "icon">) {
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

const meta: Meta<ToastStoryProps> = {
  title: "Feedback/Toast",
  args: {
    type: "neutral",
    title: "Toast title",
    message: "Toast message",
    duration: 5000,
  },
  argTypes: {
    type: {
      control: "select",
      options: toastTypes,
    },
  },
};

type Story = StoryObj<ToastStoryProps>;

export default meta;

export const Default: Story = {
  render: (props) => (
    <ToastProvider>
      <ToastTrigger {...props} />
    </ToastProvider>
  ),
};

export const Types: Story = {
  parameters: {
    controls: {
      exclude: ["type"],
    },
  },
  render: (props) => (
    <ToastProvider>
      <Row gap={2} wrap>
        {toastTypes.map((type) => (
          <ToastTrigger key={type} {...props} type={type} />
        ))}
      </Row>
    </ToastProvider>
  ),
};

export const WithIcon: Story = {
  render: (props) => (
    <ToastProvider>
      <ToastTrigger {...props} icon={<FaHeart />} />
    </ToastProvider>
  ),
};
