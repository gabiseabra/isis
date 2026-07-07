import { BiChevronLeft, BiChevronRight } from "react-icons/bi";
import { IconButton } from "../display/IconButton";
import { IconControl } from "../display/IconControl";
import { Span, Text } from "../display/Text";
import { Spinner } from "../feedback/Spinner";
import { Row } from "./FlexBox";
import styles from "./Pagination.module.scss";

export type PaginationProps = {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  loading?: boolean;
};
export function Pagination({
  currentPage,
  setCurrentPage,
  hasNextPage,
  hasPreviousPage = currentPage > 1,
  loading,
}: PaginationProps) {
  return (
    <Row
      alignY="center"
      alignX="center"
      className={styles.Pagination}
      data-loading={loading || undefined}
    >
      <IconButton
        radius={1}
        disabled={!hasPreviousPage || loading}
        onClick={() => {
          setCurrentPage(currentPage - 1);
        }}
      >
        <IconControl size="s">
          <BiChevronLeft />
        </IconControl>
      </IconButton>

      <Text className={styles.Content} align="center">
        <Span className={styles.Text}>Página {currentPage}</Span>
        {loading && <Spinner className={styles.Spinner} size="s" />}
      </Text>

      <IconButton
        radius={1}
        disabled={!hasNextPage || loading}
        onClick={() => {
          setCurrentPage(currentPage + 1);
        }}
      >
        <IconControl size="s">
          <BiChevronRight />
        </IconControl>
      </IconButton>
    </Row>
  );
}
