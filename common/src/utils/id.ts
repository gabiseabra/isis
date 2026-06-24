export type ID<T extends string = string> = `id://${T}/${number}`;

export const ID = {
  create<T extends string>(namespace: T, id: number): ID<T> {
    return `id://${namespace}/${id}`;
  },
  parse<T extends string>(
    id: ID<T>,
  ): {
    namespace: T;
    id: number;
  } {
    const [, namespace, numericPart] = id.match(/id:\/\/([^\/]+)\/(.*)/) ?? [];
    const numericId = parseInt(numericPart, 10);
    if (!namespace || !numericPart || isNaN(numericId))
      throw new Error(`Invalid id ${id}`);
    return {
      namespace: namespace as T,
      id: numericId,
    };
  },
  is<T extends string>(id: string, type: T): id is ID<T> {
    return id.startsWith(`id://${type}/`);
  },
  guard<T extends string>(type: T): (id: string) => id is ID<T> {
    return (id) => ID.is(id, type);
  },
};
