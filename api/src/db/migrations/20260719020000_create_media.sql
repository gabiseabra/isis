-- migrate:up
CREATE TYPE media_visibility AS ENUM ('public', 'private');

CREATE TABLE media_folders (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  parent_id BIGINT REFERENCES media_folders (id) ON DELETE RESTRICT,
  "hidden" BOOLEAN NOT NULL DEFAULT FALSE,
  "name" TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT array[]::TEXT[],
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX media_folders_parent_id_name_key
  ON media_folders (parent_id, "name")
  WHERE parent_id IS NOT NULL AND deleted_at IS NULL;

CREATE UNIQUE INDEX media_folders_root_name_key
  ON media_folders ("name")
  WHERE parent_id IS NULL AND deleted_at IS NULL;

CREATE TABLE media_files (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  folder_id BIGINT NOT NULL REFERENCES media_folders (id) ON DELETE RESTRICT,
  visibility media_visibility NOT NULL DEFAULT 'private',
  "name" TEXT NOT NULL,
  original_name TEXT NOT NULL,
  "description" TEXT,
  tags TEXT[] NOT NULL DEFAULT array[]::TEXT[],
  storage_key TEXT NOT NULL UNIQUE,
  mime_type VARCHAR(255) NOT NULL,
  size_bytes BIGINT NOT NULL CHECK (size_bytes >= 0),
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX media_files_folder_id_name_key
  ON media_files (folder_id, "name")
  WHERE deleted_at IS NULL;

-- migrate:down
DROP TABLE media_files;
DROP TABLE media_folders;
DROP TYPE media_visibility;
