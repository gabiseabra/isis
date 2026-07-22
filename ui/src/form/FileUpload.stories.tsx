import type { Meta, StoryObj } from "@storybook/react";
import { Text } from "../display/Text";
import { Card } from "../layout/Card";
import { Table } from "../layout/Table";
import {
  FileUpload,
  FileUploadOverlay,
  type FileUploadProps,
} from "./FileUpload";

type FileUploadStoryArgs = Pick<
  FileUploadProps,
  | "accept"
  | "size"
  | "disabled"
  | "multiple"
  | "title"
  | "label"
  | "description"
  | "error"
  | "loading"
>;

const fileUploadSizes = ["m", "l"] as const;

const meta = {
  title: "Form/FileUpload",
  args: {
    accept: "",
    size: "l",
    disabled: false,
    loading: false,
    multiple: true,
    title: "Arraste arquivos aqui",
    label: "Upload",
    description: "Drag and drop or click to select files.",
    error: "",
  },
  argTypes: {
    size: {
      control: "select",
      options: fileUploadSizes,
    },
  },
} satisfies Meta<FileUploadStoryArgs>;

type Story = StoryObj<FileUploadStoryArgs>;

export default meta;

export const Default: Story = {
  render: (args) => <FileUpload {...args} />,
};

export const Sizes: Story = {
  parameters: {
    controls: {
      exclude: ["size"],
    },
  },
  render: (args) => (
    <Table
      variant="unstyled"
      gap={2}
      style={{ width: "100%" }}
      columns={["element"]}
      rows={fileUploadSizes.map((size) => ({
        size,
        element: <FileUpload {...args} size={size} />,
      }))}
      cell={(row) => row.element}
      index={(row) => <Table.Label align="end">{row.size}</Table.Label>}
    />
  ),
};

export const Overlay: Story = {
  parameters: {
    controls: {
      exclude: ["size"],
    },
  },
  render: (args) => {
    return (
      <FileUploadOverlay {...args}>
        <Card width={420} height={234} p={4} elevation={1}>
          <Text as="h3" m={0}>
            Card content
          </Text>
          <Text color="muted">
            Drag files here and the file upload field will appear on top.
          </Text>
        </Card>
      </FileUploadOverlay>
    );
  },
};
