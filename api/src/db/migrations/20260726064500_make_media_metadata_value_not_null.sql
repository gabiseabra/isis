-- migrate:up
UPDATE media_metadata
SET "value" = 'null'::jsonb
WHERE "value" IS NULL;

ALTER TABLE media_metadata
ALTER COLUMN "value" SET NOT NULL;

-- migrate:down
ALTER TABLE media_metadata
ALTER COLUMN "value" DROP NOT NULL;
