import { oc } from "@orpc/contract";
import z from "zod";
import { SheetColumn, SheetMetadata, SheetRow } from "../../dto/sheet";
import { QuerySheetColumnsInput } from "../../dto/sheet/query-columns-input";
import { QuerySheetRowsInput } from "../../dto/sheet/query-rows-input";

export const sheets = oc.prefix("/sheets").router({
  getSheet: oc
    .route({
      description: "Get sheet metadata by id.",
    })
    .errors({
      NOT_FOUND: {},
      UNAUTHORIZED: {},
    })
    .input(SheetMetadata.pick({ id: true }))
    .output(SheetMetadata),

  querySheetColumns: oc
    .route({
      description: "...",
    })
    .errors({
      UNAUTHORIZED: {},
    })
    .input(QuerySheetColumnsInput)
    .output(
      z.object({
        items: SheetColumn.array(),
        hasNextPage: z.boolean(),
      }),
    ),

  querySheetRows: oc
    .route({
      description: "...",
    })
    .errors({
      UNAUTHORIZED: {},
    })
    .input(QuerySheetRowsInput)
    .output(
      z.object({
        items: SheetRow.array(),
        hasNextPage: z.boolean(),
      }),
    ),
});
