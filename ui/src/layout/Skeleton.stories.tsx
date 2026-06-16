import type { Meta, StoryObj } from "@storybook/react";
import { Col, Row } from "./FlexBox";
import { Skeleton, type SkeletonProps } from "./Skeleton";

type SkeletonStoryArgs = Pick<SkeletonProps, "width" | "height" | "radius"> & {
  rows: number;
};

const meta = {
  title: "Layout/Skeleton",
  args: {
    width: 280,
    height: 80,
    radius: 0.5,
    rows: 3,
  },
  render: ({ rows: _rows, ...args }) => <Skeleton {...args} />,
  decorators: [
    (Story) => (
      <Col p={4}>
        <Story />
      </Col>
    ),
  ],
} satisfies Meta<SkeletonStoryArgs>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Default: Story = {
  parameters: {
    controls: {
      exclude: ["rows"],
    },
  },
};

export const Text: Story = {
  parameters: {
    controls: {
      exclude: ["height"],
    },
  },
  render: ({ height: _height, rows, ...args }) => (
    <Skeleton.Text {...args} rows={rows} />
  ),
};

export const Composition: Story = {
  parameters: {
    controls: {
      exclude: ["width", "height", "radius"],
    },
  },
  render: ({ rows, ...args }) => (
    <Col gap={2} style={{ width: 320 }}>
      <Skeleton {...args} width="100%" height={140} radius={1.5} />
      <Skeleton.Text width="100%" rows={rows} />
      <Row gap={1}>
        <Skeleton width={96} height={32} />
        <Skeleton width={72} height={32} />
      </Row>
    </Col>
  ),
};
