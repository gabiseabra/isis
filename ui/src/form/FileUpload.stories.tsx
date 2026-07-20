import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { FileUpload, type FileUploadProps } from "./FileUpload";

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
>;

const meta = {
  title: "Form/FileUpload",
  args: {
    accept: "",
    size: "l",
    disabled: false,
    multiple: true,
    title: "Arraste arquivos aqui",
    label: "Upload",
    description: "Drag and drop or click to select files.",
    error: "",
  },
  argTypes: {
    size: {
      control: "select",
      options: ["m", "l"],
    },
  },
} satisfies Meta<FileUploadStoryArgs>;

type Story = StoryObj<FileUploadStoryArgs>;

export default meta;

export const Default: Story = {
  render: ({ multiple: _multiple, ...args }) => {
    const [files, setFiles] = useState<File[]>([]);

    return (
      <FileUpload {...args} multiple value={files} onChangeValue={setFiles} />
    );
  },
};

export const Medium: Story = {
  args: {
    size: "m",
  },
  render: ({ multiple: _multiple, ...args }) => {
    const [files, setFiles] = useState<File[]>([]);

    return (
      <FileUpload {...args} multiple value={files} onChangeValue={setFiles} />
    );
  },
};
