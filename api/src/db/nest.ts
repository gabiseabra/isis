export type Nest<T extends object> = { [K in keyof T]: T[K][] };

/**
 * `nest()` does not support optional properties as we apply Object.keys to the first item.
 * Use `null` instead of `undefined`.
 */
type NoOptional<T> = T extends object
  ? { [K in keyof T]-?: Exclude<T[K], undefined> }
  : T;

/**
 * The opposite of postgres' UNNEST.
 * Takes an array of objects and returns an object of arrays.
 */
export function nest<T extends object>(
  items: NoOptional<T>[],
): Nest<NoOptional<T>> {
  const [item] = items;
  const keys = Object.keys(item) as (keyof NoOptional<T>)[];
  return Object.fromEntries(
    keys.map((key) => [key, items.map((item) => item[key])]),
  ) as Nest<NoOptional<T>>;
}
