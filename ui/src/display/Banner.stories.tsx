import type { Meta, StoryObj } from "@storybook/react";
import { BiX } from "react-icons/bi";
import { FaBell } from "react-icons/fa";
import { Button } from "../form/Button";
import { Col } from "../layout/FlexBox";
import { Banner, type BannerProps } from "./Banner";
import { IconControl } from "./IconControl";

const bannerTypes = ["neutral", "success", "warning", "error", "info"] as const;
const bannerButtonColors = {
  neutral: "gray",
  success: "green",
  warning: "yellow",
  error: "red",
  info: "blue",
} as const;

type BannerStoryArgs = Pick<BannerProps, "type" | "title"> & {
  message: string;
};

const meta = {
  title: "Display/Banner",
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
