-- migrate:up
CREATE TYPE media_visibility AS ENUM ('public', 'private');

CREATE TABLE media_folders (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  parent_id BIGINT REFERENCES media_folders (id) ON DELETE RESTRICT,
  "hidden" BOOLEAN DEFAULT FALSE,
  "name" TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX media_folders_parent_id_name_key
  ON media_folders (parent_id, "name")
  WHERE parent_id IS NOT NULL;

CREATE UNIQUE INDEX media_folders_root_name_key
  ON media_folders ("name")
  WHERE parent_id IS NULL;

CREATE TABLE media (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  folder_id BIGINT REFERENCES media_folders (id) ON DELETE RESTRICT,
  visibility media_visibility NOT NULL DEFAULT 'private',
  "name" TEXT NOT NULL,
  original_name TEXT NOT NULL,
  storage_key TEXT NOT NULL UNIQUE,
  mime_type VARCHAR(255) NOT NULL,
  size_bytes BIGINT NOT NULL CHECK (size_bytes >= 0),
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX media_folder_id_name_key
  ON media (folder_id, "name")
  WHERE folder_id IS NOT NULL AND deleted_at IS NULL;

CREATE UNIQUE INDEX media_root_name_key
  ON media ("name")
  WHERE folder_id IS NULL AND deleted_at IS NULL;

-- migrate:down
DROP TABLE media;
DROP TABLE media_folders;
DROP TYPE media_visibility;
