import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Text } from "../display/Text";
import { Button } from "../form/Button";
import { Col } from "../layout/FlexBox";
import { Modal } from "./Modal";
import { OverlayProvider } from "./OverlayProvider";

type ModalStoryArgs = {
  defaultOpen: boolean;
  title: string;
  description: string;
};

const meta = {
  title: "Overlay/Modal",
  args: {
    defaultOpen: false,
    title: "Modal title",
    description: "Use this surface for focused content over the current page.",
  },
  decorators: [
    (Story) => (
      <OverlayProvider>
        <Story />
      </OverlayProvider>
    ),
  ],
} satisfies Meta<ModalStoryArgs>;

type Story = StoryObj<typeof meta>;

export default meta;

function ModalStory({ defaultOpen, title, description }: ModalStoryArgs) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <>
      <Button color="primary" onClick={() => setOpen(true)}>
        Open modal
      </Button>

      <Modal
        open={open}
        title={title}
        description={description}
        footer={
          <>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              color="primary"
              variant="primary"
              onClick={() => setOpen(false)}
            >
              Confirm
            </Button>
          </>
        }
        onClose={() => setOpen(false)}
      >
        <Col gap={2}>
          <Text>
            Modal content stays centered in a Radix Dialog portal and closes
            with the same data-state animation path as it opens.
          </Text>
        </Col>
      </Modal>
    </>
  );
}

export const Default: Story = {
  render: (args) => <ModalStory {...args} />,
};
