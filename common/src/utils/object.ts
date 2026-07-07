import { GenericObject } from "../types/object";
import { DistributiveOmit } from "../types/union";

export function omit<T extends object, const K extends (keyof T)[]>(
  obj: T,
  keys: K,
): DistributiveOmit<T, K[number]>;
export function omit<T extends object, const K extends (keyof T)[]>(
  obj: T,
  keys: K,
): Omit<T, K[number]> {
  const out = { ...obj };

  for (const k of keys) {
    delete out[k];
  }

  return out;
}

export function pick<T extends object, const K extends (keyof T)[]>(
  obj: T,
  keys: K,
): Pick<T, K[number]> {
  const out = {} as Pick<T, K[number]>;

  for (const k of keys) {
    out[k] = obj[k];
  }

  return out;
}

export function omitUndefined<T>(object: Partial<T>): Partial<T> {
  const out: Partial<T> = {};

  for (const key in object) {
    if (typeof object[key] !== "undefined") {
      out[key] = object[key];
    }
  }

  return out;
}

export function keys<T extends object>(object: T): (keyof T)[] {
  return Object.keys(object) as (keyof T)[];
}

export function createRecord<const K extends PropertyKey, V>(
  keys: readonly K[],
  value: (key: K) => V,
): Record<K, V> {
  const out = {} as Record<K, V>;

  for (const key of keys) {
    out[key] = value(key);
  }

  return out;
}

export function equals<T extends GenericObject>(
  a: T,
  b: T,
  eq: (a: T[keyof T], b: T[keyof T]) => boolean = (a, b) => a === b,
): boolean {
  const keysA = Object.keys(a) as (keyof T)[];
  if (keysA.length !== Object.keys(b).length) return false;
  return keysA.every((key) => key in b && eq(a[key], b[key]));
}

export function autoBind<T extends object>(self: T): T {
  return keys(self).reduce((self, key) => {
    if (self[key] instanceof Function) {
      return Object.assign(self, { [key]: self[key].bind(self) });
    }
    return self;
  }, self);
}

export function entries<T extends object>(object: T): [keyof T, T[keyof T]][] {
  const out: [keyof T, T[keyof T]][] = [];
  for (const key in object) out.push([key, object[key]]);
  return out;
}
