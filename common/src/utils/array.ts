import { hash } from "./hash";

export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

export const uniqueBy = <T, K>(items: T[], key: (item: T) => K): T[] =>
  items.filter(
    (item, index) =>
      items.findIndex((other) => Object.is(key(other), key(item))) === index,
  );

export function groupBy<K, T>(items: T[], key: (item: T) => K): [K, T[]][] {
  return Array.from(
    items
      .reduce(
        (groups, item) => {
          const groupKey = key(item);
          if (groups.has(hash(groupKey)))
            groups.get(hash(groupKey))?.[1].push(item);
          else groups.set(hash(groupKey), [groupKey, [item]]);
          return groups;
        },
        new Map([]) as Map<string, [K, T[]]>,
      )
      .entries(),
  ).map(([, value]) => value);
}

export function combinations<A, B, T>(
  a: A[],
  b: B[],
  f: (a: A, b: B, i: number, j: number) => T,
): T[] {
  return a.flatMap((x, i) => b.map((y, j) => f(x, y, i, j)));
}

export function zip<A, B, T>(
  a: A[],
  b: B[],
  f: (a: A, b: B, index: number) => T,
): T[] {
  return a.flatMap((x, i) => b.slice(i, i + 1).map((y) => f(x, y, i)));
}
