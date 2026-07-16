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
