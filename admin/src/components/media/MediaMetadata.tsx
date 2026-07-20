import { Path } from "@isis/common/dto/path";
import { extractErrorMessage } from "@isis/common/utils/error";
import { Span, Text } from "@isis/ui/display/Text";
import { EmptyState } from "@isis/ui/feedback/EmptyState";
import { Spinner } from "@isis/ui/feedback/Spinner";
import { Col, ColProps, Row } from "@isis/ui/layout/FlexBox";
import { Table } from "@isis/ui/layout/Table";
import { skipToken, useQuery } from "@tanstack/react-query";
import { BiError } from "react-icons/bi";
import { orpcQuery } from "../../orpc/client";

type MediaMetadataProps = Omit<ColProps, "children"> & {
  path?: Path;
};

export function MediaMetadata({ path, ...props }: MediaMetadataProps) {
  const entryQuery = useQuery(
    orpcQuery.media.get.queryOptions({ input: path ? { path } : skipToken }),
  );

  if (path) {
    if (entryQuery.isPending)
      return (
        <Col alignX="center" p={4}>
          <Spinner size="s" color="blue" />
        </Col>
      );

    if (entryQuery.isError)
      return (
        <EmptyState
          size="m"
          color="red"
          icon={<BiError />}
          title={extractErrorMessage(entryQuery.error)}
        />
      );
  }

  return (
    <Col gap={1} p={1} {...props}>
      <Row wrap gap={1} alignX="space-between" alignY="center">
        <Text>
          <Span bold>{entryQuery.data?.name ?? "Root"}</Span>
        </Text>

        <Text noWrap size="caption" color="muted">
          <Span bold>{`/${entryQuery.data?.path ?? ""}`}</Span>
        </Text>
      </Row>

      {entryQuery.data && (
        <Table
          variant="unstyled"
          columns={["label", "value"]}
          rows={[
            {
              label: <Table.Label>Criado</Table.Label>,
              value: (
                <Text size="caption">
                  {entryQuery.data.createdAt.toLocaleDateString()}
                </Text>
              ),
            },
          ]}
          cell={(row, col) => row[col]}
        />
      )}
    </Col>
  );
}
