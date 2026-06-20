export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

export const uniqueBy = <T, K>(items: T[], key: (item: T) => K): T[] =>
  items.filter(
    (item, index) =>
      items.findIndex((other) => Object.is(key(other), key(item))) === index,
  );
