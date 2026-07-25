import { extractDeclaration } from "@isis/common/utils/source-code";
import { useSessionStorage } from "@mantine/hooks";
import type { Meta, StoryObj } from "@storybook/react";
import { Text } from "../display/Text";
import { Card } from "./Card";
import { Resizable, type ResizableProps } from "./Resizable";
import ownSource from "./Resizable.stories.tsx?raw";

type ResizableStoryProps = Pick<ResizableProps, "positions" | "aspectRatio">;

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
    positions: ["right"],
  },
  argTypes: {
    aspectRatio: {
      control: "number",
    },
    positions: {
      control: "multi-select",
      options: positions,
    },
  },
};

type Story = StoryObj<ResizableStoryProps>;

export default meta;

function ResizableStory({
  id,
  aspectRatio,
  positions,
}: ResizableStoryProps & { id: string }) {
  const [size, setSize] = useSessionStorage({
    key: `resizable-story-${id}-size`,
    defaultValue: { width: 420, height: 234 },
  });

  return (
    <Resizable
      id={id}
      aspectRatio={aspectRatio}
      positions={positions}
      size={size}
      onResize={setSize}
    >
      <Card p={4} style={{ ...size, boxSizing: "border-box" }}>
        <Text m={0} as="h2">
          Card title
        </Text>
        <Text>Drag the sides / edges to resize this card.</Text>
      </Card>
    </Resizable>
  );
}

export const Default: Story = {
  parameters: {
    docs: {
      source: {
        code: extractDeclaration(ownSource, "function", "ResizableStory"),
        language: "tsx",
      },
    },
  },
  render: (props) => <ResizableStory id="Default" {...props} />,
};
