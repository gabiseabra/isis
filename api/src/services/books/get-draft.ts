import { DraftBookResult } from "@isis/common/dto/book/draft";
import { BookInput } from "@isis/common/dto/book/input";
import { DraftBookPageResult } from "@isis/common/dto/book/page/draft";
import { BookPageInput } from "@isis/common/dto/book/page/input";
import { UUID } from "@isis/common/dto/uuid";
import { ID } from "@isis/common/utils/id";
import { parseObject } from "@isis/common/utils/parse-object";
import {
  getActiveDraftBook,
  getActiveDraftBookPage,
  getDraftBook,
  getDraftBookPage,
} from "./repo";

export async function getDraftBookResult(
  idOrUuid: { id: ID<"Book"> } | { uuid: UUID },
): Promise<DraftBookResult | null> {
  const draft = await ("id" in idOrUuid
    ? getActiveDraftBook(idOrUuid.id)
    : getDraftBook(idOrUuid.uuid));

  if (!draft) return null;

  const result = parseObject(
    BookInput,
    BookInput.default({
      id: draft.bookId,
      ...draft,
    }),
    draft,
  );

  return {
    ...result,
    data: draft,
  };
}

export async function getDraftBookPageResult(
  idOrUuid: { id: ID<"BookPage"> } | { uuid: UUID },
): Promise<DraftBookPageResult | null> {
  const draftPage = await ("id" in idOrUuid
    ? getActiveDraftBookPage(idOrUuid.id)
    : getDraftBookPage(idOrUuid.uuid));

  if (!draftPage) return null;

  const draftBook = await getDraftBook(draftPage.draftBookUuid);

  const result = parseObject(
    BookPageInput,
    {
      ...draftPage,
      id: draftPage.pageId,
      bookId: draftBook?.bookId ?? "id://Book/0",
      mediaId: draftPage.mediaId ?? "id://Media/0",
      pageNumber: draftPage.pageNumber ?? 0,
      pageType: draftPage.pageType ?? "",
      tags: draftPage.tags ?? [],
    },
    draftPage,
  );

  return {
    ...result,
    data: draftPage,
  };
}
