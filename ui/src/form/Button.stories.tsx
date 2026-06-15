import type { Meta, StoryObj } from "@storybook/react";
import { type ReactNode } from "react";
import { FaArrowRight, FaPlus } from "react-icons/fa";
import { Row } from "../layout/FlexBox";
import { Button, type ButtonProps } from "./Button";

type ButtonStoryArgs = Pick<
  ButtonProps,
  "color" | "size" | "disabled" | "loading"
>;

type ButtonVariant = NonNullable<ButtonProps["variant"]>;

const variants = ["primary", "secondary", "link"] as const;
const colors = [
  "default",
  "gray",
  "orange",
  "yellow",
  "green",
  "blue",
  "purple",
  "pink",
  "red",
  "primary",
] as const;
const sizes = ["s", "m", "l"] as const;

const meta = {
  title: "Form/Button",
  args: {
    color: "primary",
    size: "m",
    disabled: false,
    loading: false,
  },
  render: (args) => (
    <ButtonTable
      rows={["default"] as const}
      render={(_, variant) => (
        <Button {...args} variant={variant}>
          Button
        </Button>
      )}
    />
  ),
  argTypes: {
    color: {
      control: "select",
      options: colors,
    },
    size: {
      control: "select",
      options: sizes,
    },
  },
  parameters: {
    controls: {
      include: ["color", "size", "disabled", "loading"],
    },
  },
  decorators: [
    (Story) => (
      <Row p={4} gap={1}>
        <Story />
      </Row>
    ),
  ],
} satisfies Meta<ButtonStoryArgs>;

type Story = StoryObj<typeof meta>;

export default meta;

export const Default: Story = {};

export const Colors: Story = {
  parameters: {
    controls: {
      include: ["size", "disabled", "loading"],
    },
  },
  render: (args) => (
    <ButtonTable
      rows={colors}
      render={(color, variant) => (
        <Button {...args} color={color} variant={variant}>
          Button
        </Button>
      )}
    />
  ),
};

export const Sizes: Story = {
  parameters: {
    controls: {
      include: ["color", "disabled", "loading"],
    },
  },
  render: (args) => (
    <ButtonTable
      rows={sizes}
      render={(size, variant) => (
        <Button {...args} size={size} variant={variant}>
          Button
        </Button>
      )}
    />
  ),
};

export const WithSlots: Story = {
  parameters: {
    controls: {
      include: ["color", "size", "disabled", "loading"],
    },
  },
  render: (args) => (
    <ButtonTable
      rows={["slots"] as const}
      render={(_, variant) => (
        <Button
          {...args}
          left={<FaPlus />}
          right={<FaArrowRight />}
          variant={variant}
        >
          Button
        </Button>
      )}
    />
  ),
};

export const Loading: Story = {
  args: {
    loading: true,
  },
  parameters: {
    controls: {
      include: ["color", "size", "disabled"],
    },
  },
  render: (args) => (
    <ButtonTable
      rows={["loading"] as const}
      render={(_, variant) => (
        <Button {...args} variant={variant}>
          Button
        </Button>
      )}
    />
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  parameters: {
    controls: {
      include: ["color", "size", "loading"],
    },
  },
  render: (args) => (
    <ButtonTable
      rows={["disabled"] as const}
      render={(_, variant) => (
        <Button {...args} variant={variant}>
          Button
        </Button>
      )}
    />
  ),
};

function ButtonTable<Row extends string>({
  rows,
  render,
}: {
  rows: readonly Row[];
  render: (row: Row, variant: ButtonVariant) => ReactNode;
}) {
  const showRowLabel = rows.length > 1;

  return (
    <table
      style={{
        borderCollapse: "separate",
        borderSpacing: "calc(var(--space) * 2) var(--space)",
      }}
    >
      <thead>
        <tr>
          {showRowLabel && <th />}
          {variants.map((variant) => (
            <th key={variant}>{variant}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row}>
            {showRowLabel && <th>{row}</th>}
            {variants.map((variant) => (
              <td key={variant}>{render(row, variant)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
