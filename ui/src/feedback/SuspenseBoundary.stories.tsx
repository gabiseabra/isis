import { ORPCError } from "@orpc/contract";
import type { Meta, StoryObj } from "@storybook/react";
import { type ReactNode, useState } from "react";
import { Text } from "../display/Text";
import { Button } from "../form/Button";
import { Col, Row } from "../layout/FlexBox";
import { Banner } from "./Banner";
import { Spinner } from "./Spinner";
import { PageSuspenseBoundary, SuspenseBoundary } from "./SuspenseBoundary";

type DemoResource = {
  read: () => ReactNode;
};

type DemoMode = "content" | "error";

type DemoState = {
  key: number;
  mode: DemoMode | null;
  resource: DemoResource | null;
};

const meta = {
  title: "Feedback/SuspenseBoundary",
  render: () => <Demo />,
  decorators: [
    (Story) => (
      <Col p={4} gap={2}>
        <Story />
      </Col>
    ),
  ],
  parameters: {
    controls: {
      disable: true,
    },
  },
} satisfies Meta;

type Story = StoryObj<typeof meta>;

export default meta;

export const Default: Story = {};

export const PageLoader: Story = {
  render: () => <Demo page />,
};

function Demo({ page = false }: { page?: boolean }) {
  const [demo, setDemo] = useState<DemoState>({
    key: 0,
    mode: null,
    resource: null,
  });

  const load = (mode: DemoMode | null) => {
    setDemo((demo) => ({
      key: demo.key + 1,
      mode,
      resource: mode ? resourceFor(mode) : null,
    }));
  };

  const retry = () => {
    if (demo.mode) {
      load(demo.mode);
    }
  };

  return (
    <Col gap={2}>
      <Row gap={1} wrap>
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

      <Col style={page ? { height: 240 } : undefined}>
        {page ? (
          <PageSuspenseBoundary
            key={demo.key}
            resourceName="content"
            onRetry={retry}
          >
            <Resource resource={demo.resource} />
          </PageSuspenseBoundary>
        ) : (
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
                {error instanceof globalThis.Error
                  ? error.message
                  : String(error)}
              </Banner>
            )}
          >
            <Resource resource={demo.resource} />
          </SuspenseBoundary>
        )}
      </Col>
    </Col>
  );
}

function resourceFor(mode: DemoMode): DemoResource {
  return mode === "content" ? success() : failure();
}

function Resource({ resource }: { resource: DemoResource | null }) {
  if (!resource) {
    return <Text color="muted">Choose a load path.</Text>;
  }

  return resource.read();
}

function success(): DemoResource {
  let loaded = false;
  const promise = new Promise<void>((resolve) => {
    window.setTimeout(() => {
      loaded = true;
      resolve();
    }, 1000);
  });

  return {
    read() {
      if (!loaded) {
        throw promise;
      }

      return (
        <Banner type="success" title="Content loaded">
          The suspense boundary replaced the loader with the loaded content.
        </Banner>
      );
    },
  };
}

function failure(): DemoResource {
  let error: ORPCError<"SERVICE_UNAVAILABLE", undefined> | null = null;
  const promise = new Promise<void>((resolve) => {
    window.setTimeout(() => {
      error = new ORPCError("SERVICE_UNAVAILABLE", {
        message: "The requested content failed to load.",
      });
      resolve();
    }, 1000);
  });

  return {
    read() {
      if (!error) {
        throw promise;
      }

      throw error;
    },
  };
}
