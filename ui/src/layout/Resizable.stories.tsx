import { extractDeclaration } from "@isis/common/utils/source-code";
import { useSessionStorage } from "@mantine/hooks";
import type { Meta, StoryObj } from "@storybook/react";
import { Text } from "../display/Text";
import { Button } from "../form/Button";
import { Card } from "./Card";
import { Resizable, type ResizableProps } from "./Resizable";
import ownSource from "./Resizable.stories.tsx?raw";

export type ResizableStoryProps = Pick<
  ResizableProps,
  "positions" | "aspectRatio"
> & {
  defaultWidth?: number;
  defaultHeight?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
};

const positions = [
  "top",
  "left",
  "right",
  "bottom",
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
] as const;

const meta: Meta<ResizableStoryProps> = {
  title: "Layout/Resizable",
  args: {
    positions: [...positions],
  },
  argTypes: {
    positions: {
      control: "multi-select",
      options: positions,
      defaultWidth: 420,
      defaultHeight: 234,
    },
    defaultWidth: {
      control: "number",
    },
    defaultHeight: {
      control: "number",
    },
    aspectRatio: {
      control: "number",
    },
    minWidth: {
      control: "number",
    },
    minHeight: {
      control: "number",
    },
    maxWidth: {
      control: "number",
    },
    maxHeight: {
      control: "number",
    },
  },
};

type Story = StoryObj<ResizableStoryProps>;

export default meta;

function ResizableStory({
  id,
  aspectRatio,
  positions,
  minWidth,
  minHeight,
  maxWidth,
  maxHeight,
  defaultWidth,
  defaultHeight,
}: ResizableStoryProps & { id: string }) {
  const [size, setSize, resetSize] = useSessionStorage({
    key: `resizable-story-${id}-size`,
    defaultValue: { width: defaultWidth, height: defaultHeight },
  });

  const min =
    minWidth || minHeight ? { width: minWidth, height: minHeight } : undefined;
  const max =
    maxWidth || maxHeight ? { width: maxWidth, height: maxHeight } : undefined;

  return (
    <Resizable
      id={id}
      aspectRatio={aspectRatio}
      positions={positions}
      size={size}
      onResize={setSize}
      min={min}
      max={max}
    >
      <Card
        p={4}
        style={{ ...size, boxSizing: "border-box" }}
        alignY="center"
        alignX="center"
      >
        <Text m={0} as="h2">
          Card title
        </Text>
        <Text>Drag the sides / edges to resize this card.</Text>

        <Button data-test-id="reset" onClick={() => resetSize()}>
          Click to reset the size
        </Button>
      </Card>
    </Resizable>
  );
}

export const Default = {
  parameters: {
    docs: {
      source: {
        code: extractDeclaration(ownSource, "function", "ResizableStory"),
        language: "tsx",
      },
    },
  },
  render: (props) => <ResizableStory id="Default" {...props} />,
} satisfies Story;
