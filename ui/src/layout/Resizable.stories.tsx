import type { Meta, StoryObj } from "@storybook/react";
import { useId } from "react";
import { useSessionStorage } from "usehooks-ts";
import { Card } from "./Card";
import { Resizable, type ResizableProps } from "./Resizable";

type ResizableStoryProps = Pick<ResizableProps, "aspectRatio" | "direction"> & {
  initialWidth?: number;
  initialHeight?: number;
};

const meta: Meta<ResizableStoryProps> = {
  title: "Layout/Resizable",
  args: {
    direction: "x",
    initialHeight: 300,
    initialWidth: 300,
  },
  argTypes: {
    direction: {
      control: "select",
      options: ["x", "y", "both"],
    },
    aspectRatio: {
      control: "number",
    },
    initialHeight: {
      control: "number",
    },
    initialWidth: {
      control: "number",
    },
  },
  decorators: [
    (Story) => (
      <div style={{ height: "calc(100vh - 32px)", width: "100%" }}>
        <Story />
      </div>
    ),
  ],
};

type Story = StoryObj<ResizableStoryProps>;

export default meta;

function ResizableStory({
  id,
  aspectRatio,
  direction,
  initialWidth = 300,
  initialHeight = 300,
}: ResizableStoryProps & { id: string }) {
  const localId = useId();
  const [width, setWidth] = useSessionStorage(
    `resizable-story-${id ?? localId}-width`,
    initialWidth,
  );
  const [height, setHeight] = useSessionStorage(
    `resizable-story-${id ?? localId}-height`,
    initialHeight,
  );
  return (
    <Resizable
      id={id}
      aspectRatio={aspectRatio}
      {...(direction === "both"
        ? {
            direction: "both",
            onResize({ width, height }) {
              setWidth(width);
              setHeight(height);
            },
          }
        : {
            direction,
            onResize(size) {
              if (direction === "x") setWidth(size);
              if (direction === "y") setHeight(size);
            },
          })}
    >
      <Card style={{ width, height }} />
    </Resizable>
  );
}

export const Default: Story = {
  render: (props) => <ResizableStory id="Default" {...props} />,
};
