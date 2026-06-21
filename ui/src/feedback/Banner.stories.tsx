import type { Meta, StoryObj } from "@storybook/react";
import { BiX } from "react-icons/bi";
import { FaBell } from "react-icons/fa";
import { IconControl } from "../display/IconControl";
import { Button } from "../form/Button";
import { Col } from "../layout/FlexBox";
import { Banner, type BannerProps } from "./Banner";

const bannerTypes = ["neutral", "success", "warning", "error", "info"] as const;

type BannerStoryProps = Pick<BannerProps, "type" | "title"> & {
  message: string;
};

const meta: Meta<BannerStoryProps> = {
  title: "Feedback/Banner",
  args: {
    type: "info",
    title: "Banner title",
    message: "Banner message",
  },
  argTypes: {
    type: {
      control: "select",
      options: bannerTypes,
    },
  },
};

type Story = StoryObj<typeof meta>;

export default meta;

export const Default: Story = {
  render: ({ message, ...args }) => <Banner {...args}>{message}</Banner>,
};

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
    <Col gap={2}>
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

      <Banner
        {...args}
        action={
          <Button variant="link" color="currentColor" right={<BiX />}>
            Close
          </Button>
        }
      >
        {message}
      </Banner>
    </Col>
  ),
};
