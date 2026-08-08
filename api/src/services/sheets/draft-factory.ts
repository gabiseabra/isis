import { DraftState } from "@isis/common/dto/draft-state";
import { ID } from "@isis/common/utils/id";
import { NonEmpty } from "@isis/common/utils/non-empty";
import { createRecord, keys, mapRecord } from "@isis/common/utils/object";
import { parseZodObject } from "@isis/common/utils/parse-zod-object";
import z from "zod";
import { ensureDraftBookColumns } from "../books/draft/columns";
import { unit } from "../db/unit";
import { createSheetFromJson } from "./create-from-json";
import { createSheetColumnRecord, getSheetRow } from "./db";

type AnyEntity<id extends ID = ID> = { id?: id };
type DraftData<Input extends AnyEntity, Draft extends AnyEntity> = {
  id: Draft["id"];
  targetId: Input["id"];
  sheetId: ID<"Sheet">;
  rowId: number;
};

export class DraftFactory<
  Input extends AnyEntity,
  Draft extends AnyEntity & DraftState<keyof Input>,
> {
  constructor(
    private impl: {
      inputSchema: z.ZodObject<{
        [k in keyof Input]: z.ZodType<Input[k]>;
      }>;
      columnTarget: (key: keyof Input) => string;
      getInitialData: (id: NonNullable<Input["id"]>) => Promise<Input>;
      getDraftData: (
        id: NonNullable<Draft["id"]>,
      ) => Promise<DraftData<Input, Draft> | null>;
      getActiveDraftData: (
        id: NonNullable<Input["id"]>,
      ) => Promise<DraftData<Input, Draft> | null>;
      upsertDraftData: (input: {
        id: Input["id"];
        sheetId: ID<"Sheet">;
        rowId: number;
      }) => Promise<DraftData<Input, Draft>>;
    },
  ) {}

  async getActive(id: NonNullable<Input["id"]>) {
    const [initialData, draftData] = await Promise.all([
      this.impl.getInitialData(id),
      this.impl.getActiveDraftData(id),
    ]);

    if (!initialData || !draftData) return null;

    const { sheetId, rowId } = draftData;

    const columns = await this.getColumns(sheetId);
    const row = await getSheetRow({
      sheetId,
      rowId,
      columnIds: Object.values(columns)
        .filter((col) => col.columnId > 0)
        .map((col) => col.columnId),
    });

    const input = createRecord(
      keys(columns),
      (key) => DraftState.getCell({ row, columns }, key)?.value ?? undefined,
    );

    const { data, errors } = await this.validate(initialData, input);

    return {
      ...draftData,
      data,
      row,
      columns,
      errors,
    };
  }

  async validate(
    dataOrId: Required<Input["id"]> | Input,
    input?: Partial<Record<keyof Input, unknown>>,
  ) {
    const data =
      typeof dataOrId === "string"
        ? await this.impl.getInitialData(dataOrId)
        : dataOrId;
    return parseZodObject(data, input ?? data, this.impl.inputSchema);
  }

  async upsert(input: Input): Promise<Draft & { data: Input }> {
    const [initialData, existingDraft] = await Promise.all([
      input.id ? this.impl.getInitialData(input.id) : null,
      input.id ? this.impl.getActiveDraftData(input.id) : null,
    ]);

    // validation

    const { data, errors } = await this.validate(input);

    // mutation

    return unit(async () => {
      const { sheetId, rowId } =
        existingDraft ??
        (
          await createSheetFromJson(
            `${input.id ?? "new-draft"}.json`,
            [],
            [input],
          )
        ).rows[0];

      const draftData = await this.impl.upsertDraftData({
        id: input.id,
        sheetId,
        rowId,
      });

      const columns = await ensureDraftBookColumns(sheetId);

      const _cells = entries(columns).map(([key, col]) => ({
        rowId,
        columnId: col.columnId,
        value: input[key],
      }));
      const cells = NonEmpty.isNonEmpty(_cells)
        ? await bulkUpsertSheetCell({
            sheetId,
            cells: _cells,
          })
        : [];

      return {
        ...draftData,
        data,
        errors,
        columns,
        row: {
          sheetId,
          rowId,
          cells,
        },
      };
    });
  }

  private async getColumns(sheetId: ID<"Sheet">): Promise<Draft["columns"]> {
    return mapRecord(
      await createSheetColumnRecord<keyof Input>(
        sheetId,
        createRecord(keys(this.impl.inputSchema.shape), this.impl.columnTarget),
      ),
      (col, key) =>
        col ?? {
          key,
          sheetId: `id://Sheet/0`,
          columnId: -1,
          name: key,
          target: this.impl.columnTarget(key),
          tags: [],
        },
    );
  }
}
