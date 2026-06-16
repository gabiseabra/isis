import type { Meta, StoryObj } from "@storybook/react";
import { BiX } from "react-icons/bi";
import { FaBell } from "react-icons/fa";
import { IconControl } from "../display/IconControl";
import { Col } from "../layout/FlexBox";
import { Banner, type BannerProps } from "./Banner";

const bannerTypes = ["neutral", "success", "warning", "error", "info"] as const;

type BannerStoryArgs = Pick<BannerProps, "type" | "title"> & {
  message: string;
};

const meta = {
  title: "Feedback/Banner",
  args: {
    type: "info",
    title: "Banner title",
    message: "Banner message",
  },
  render: ({ message, ...args }) => <Banner {...args}>{message}</Banner>,
  argTypes: {
    type: {
      control: "select",
      options: bannerTypes,
    },
  },
  decorators: [
    (Story) => (
      <Col p={4} gap={2}>
        <Story />
      </Col>
    ),
  ],
} satisfies Meta<BannerStoryArgs>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Default: Story = {};

export const Types: Story = {
  parameters: {
    controls: {
      exclude: ["type"],
    },
  },
  render: ({ message, ...args }) => (
    <Col gap={2}>
      {bannerTypes.map((type) => (
        <Banner key={type} {...args} type={type} title={`${type} banner`}>
          {message}
        </Banner>
      ))}
    </Col>
  ),
};

export const WithIcon: Story = {
  render: ({ message, ...args }) => (
    <Banner {...args} icon={<FaBell />}>
      {message}
    </Banner>
  ),
};

export const WithAction: Story = {
  render: ({ message, ...args }) => (
    <Banner
      {...args}
      action={
        <IconControl as="button" size="s" color="currentColor">
          <BiX />
        </IconControl>
      }
    >
      {message}
    </Banner>
  ),
};
