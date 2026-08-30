# How to write a repo file guideline

- one repo file owns one type, declares functions to read/write that entity to the database.
- do not declare any types or helpers outside of the row type class and mapper, and mutation input types.
- use createBatchedFunction to batch simple getters and mutations.
- avoid unecessary typescript and sql casts.

## Row type

- declare private row type as a class with public properties for each column with the same name as the table.
- order of fields doesn't matter.
- declare a private mapper from the row type to the public type. use this mapper to return from the queries and mutations.

## Queries

- declare complex input types inline.
- use undefined for optionals parameters.
- use null for explicit null values.
- export batched simple getter from the entity ID.
- use one `sql` / `sqlOne` / `sqlOneMaybe` per function.

## Mutations

- declare shared input type with all optional parameters.
- use undefined for optionals parameters.
- use null for explicit null values.
- export batched create / update mutations if the entity has sequential numeric id.
  - use `WithRequired` to require required fields for create
  - fallback to comitted value on undefined fields.
  - set NULL on NULL fields.
- export batched upsert function if the entity has UUID.

## Relations

- export batched clear function to delete all relations
  - accept entity ID and optional relation ID.
- export batched add function to create relations
  - accept entity ID and relation data.

