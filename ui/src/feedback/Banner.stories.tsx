import type { Meta, StoryObj } from "@storybook/react";
import { BiX } from "react-icons/bi";
import { FaBell } from "react-icons/fa";
import { IconButton } from "../display/IconButton";
import { IconControl } from "../display/IconControl";
import { Button } from "../form/Button";
import { Col } from "../layout/FlexBox";
import { Table } from "../layout/Table";
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
    <Table
      variant="unstyled"
      gap={2}
      style={{ width: "100%" }}
      columns={["element"]}
      rows={bannerTypes.map((type) => ({
        element: (
          <Banner key={type} {...args} type={type} title={`${type} banner`}>
            {message}
          </Banner>
        ),
      }))}
      cell={(row, col) => row[col]}
      index={(_data, index) => (
        <Table.Label align="end">{bannerTypes[index]}</Table.Label>
      )}
    />
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
          <IconButton>
            <IconControl color="muted" size="s">
              <BiX />
            </IconControl>
          </IconButton>
        }
      >
        {message}
      </Banner>

      <Banner
        {...args}
        alignY="center"
        action={
          <Col alignY="center">
            <Button variant="link" color="currentColor" right={<BiX />}>
              Close
            </Button>
          </Col>
        }
      >
        {message}
      </Banner>
    </Col>
  ),
};
