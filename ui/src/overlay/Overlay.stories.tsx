import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Text } from "../display/Text";
import { Card } from "../layout/Card";
import { Col } from "../layout/FlexBox";
import { Overlay } from "./Overlay";

type OverlayStoryProps = {
  backdrop: "light" | "dark";
};

const meta: Meta<OverlayStoryProps> = {
  title: "Overlay/Overlay",
  args: {
    backdrop: "light",
  },
  argTypes: {
    backdrop: {
      control: "select",
      options: ["light", "dark"],
    },
  },
};

type Story = StoryObj<OverlayStoryProps>;

export default meta;

function OverlayStory(props: OverlayStoryProps) {
  const [open, setOpen] = useState(false);
  return (
    <Overlay.Boundary
      asChild
      onMouseOver={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Card elevation={1} p={4} gap={1} style={{ width: 420, height: 234 }}>
        <Text as="h3" m={0}>
          Card content
        </Text>
        <Text>Hover to show the overlay content.</Text>

        <Overlay open={open}>
          <Col height="100%" width="100%" alignX="center" alignY="center">
            <Text>The overlay content appears on top.</Text>
          </Col>

          <Overlay.Backdrop variant={props.backdrop} />
        </Overlay>
      </Card>
    </Overlay.Boundary>
  );
}

export const Default: Story = {
  render: (props) => <OverlayStory {...props} />,
};
