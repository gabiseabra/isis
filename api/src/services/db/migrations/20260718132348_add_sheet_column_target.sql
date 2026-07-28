-- migrate:up
ALTER TABLE sheet_columns
  ADD COLUMN "target" TEXT;

CREATE UNIQUE INDEX sheet_columns_sheet_id_target_idx
  ON sheet_columns (sheet_id, "target")
  WHERE "target" IS NOT NULL;

-- migrate:down
DROP INDEX sheet_columns_sheet_id_target_idx;

ALTER TABLE sheet_columns
  DROP COLUMN "target";
