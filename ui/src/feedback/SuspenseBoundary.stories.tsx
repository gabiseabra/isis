import { ORPCError } from "@orpc/contract";
import type { Meta, StoryObj } from "@storybook/react";
import { type ReactNode, useState } from "react";
import { Text } from "../display/Text";
import { Button } from "../form/Button";
import { Col, Row } from "../layout/FlexBox";
import { Banner } from "./Banner";
import { Spinner } from "./Spinner";
import {
  SuspenseBoundary,
  type SuspenseBoundaryProps,
} from "./SuspenseBoundary";

type SuspenseBoundaryStoryProps = Pick<SuspenseBoundaryProps, never>;

type DemoMode = "content" | "error";

function createDemoResource(mode: DemoMode): { read: () => ReactNode } {
  let result: ReactNode;
  let error: Error | null = null;
  const promise = new Promise<void>((resolve) => {
    window.setTimeout(() => {
      if (mode === "content") {
        result = (
          <Banner type="success" title="Content loaded">
            The suspense boundary replaced the loader with the loaded content.
          </Banner>
        );
      } else {
        error = new ORPCError("SERVICE_UNAVAILABLE", {
          message: "The requested content failed to load.",
        });
      }

      resolve();
    }, 1000);
  });

  return {
    read() {
      if (error) {
        throw error;
      }

      if (!result) {
        throw promise;
      }

      return result;
    },
  };
}

const meta: Meta<SuspenseBoundaryStoryProps> = {
  title: "Feedback/SuspenseBoundary",
};

type Story = StoryObj<SuspenseBoundaryStoryProps>;

export default meta;

function DemoResourceContent({
  resource,
}: {
  resource: ReturnType<typeof createDemoResource> | null;
}) {
  if (resource) return resource.read();

  return <Text color="muted">Choose a load path.</Text>;
}

function SuspenseBoundaryStory() {
  const [demo, setDemo] = useState<{
    key: number;
    mode: DemoMode | null;
    resource: ReturnType<typeof createDemoResource> | null;
  }>({ key: 0, mode: null, resource: null });

  const load = (mode: DemoMode | null) => {
    setDemo(({ key }) => ({
      key: key + 1,
      mode,
      resource: mode ? createDemoResource(mode) : null,
    }));
  };

  const retry = () => {
    if (demo.mode) {
      load(demo.mode);
    }
  };

  const content = <DemoResourceContent resource={demo.resource} />;

  return (
    <Col p={4} gap={2}>
      <Row gap={2} wrap>
        <Button
          color="primary"
          variant="primary"
          onClick={() => load("content")}
        >
          Load content
        </Button>
        <Button color="red" onClick={() => load("error")}>
          Load error
        </Button>
        <Button onClick={() => load(null)}>Reset</Button>
      </Row>

      <SuspenseBoundary
        key={demo.key}
        loading={<Spinner size="m" />}
        error={(error) => (
          <Banner
            type="error"
            title="Unable to load content"
            action={
              <Button color="red" variant="link" onClick={retry}>
                Retry
              </Button>
            }
          >
            {error instanceof globalThis.Error ? error.message : String(error)}
          </Banner>
        )}
      >
        {content}
      </SuspenseBoundary>
    </Col>
  );
}

export const Default: Story = {
  render: () => <SuspenseBoundaryStory />,
};
