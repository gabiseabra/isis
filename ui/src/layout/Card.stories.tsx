import type { Meta, StoryObj } from "@storybook/react";
import { Text } from "../display/Text";
import { Card, type CardProps } from "./Card";
import { Col, Row } from "./FlexBox";

type CardStoryArgs = Pick<CardProps, "elevation">;

const elevations = [0, 1, 2] as const;

const meta = {
  title: "Layout/Card",
  args: {
    elevation: 1,
  },
  render: (args) => (
    <Card {...args} p={3} gap={1} style={{ width: 240 }}>
      <Text size="h5">Card</Text>
      <Text color="muted">Elevation controls shadow and border radius.</Text>
    </Card>
  ),
  argTypes: {
    elevation: {
      control: "select",
      options: elevations,
    },
  },
  parameters: {
    controls: {
      include: ["elevation"],
    },
  },
  decorators: [
    (Story) => (
      <Col p={4}>
        <Story />
      </Col>
    ),
  ],
} satisfies Meta<CardStoryArgs>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Default: Story = {};

export const Elevations: Story = {
  render: (args) => (
    <Row gap={3} wrap>
      {elevations.map((elevation) => (
        <Card
          key={elevation}
          {...args}
          elevation={elevation}
          p={3}
          gap={1}
          style={{ width: 220 }}
        >
          <Text size="h5">Elevation {elevation}</Text>
          <Text color="muted">More elevation, more shadow and radius.</Text>
        </Card>
      ))}
    </Row>
  ),
};
