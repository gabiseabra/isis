## How to structure DTOs guide

- DTOs live in common and are shared between web/admin & api.
- Declare a DTO by exporting a zod schema and a type derived from the schema with the same name.
- In order to reduce front-end bundle sizes, import DTO schemas asynchronously and import types using `import type` keyword.

## Entities

- Create a schema for existing database entries including metadata fields such as createdAt / updatedAt.
- For relations, provide a `relatedTableId` / `relatedTableUuid` field. Don't include data from the related table, fetch it separately in the FE.

### Inputs

If the entity supports create/update operations...

- Create a supporting input type excluding such fields and with optional id.
- Represent the related thing as `ThingInput` in the input. Handle by creating entries without ID when processing the upsert in the BE.

### Drafts

If the entity supports create/update via drafts...

- Create a supporting draft type derived from input with all optional fields + draft table metadata such as uuid / appliedAt / deletedAt.
- 