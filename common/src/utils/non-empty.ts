import { never } from "zod";

export type NonEmpty<T> = [T, ...T[]];

export const NonEmpty = {
  create<T>(t: T, ...ts: T[]): NonEmpty<T> {
    return [t, ...ts];
  },

  append<T>([t, ...ts]: NonEmpty<T>, ...tss: T[]): NonEmpty<T> {
    return [t, ...ts, ...tss];
  },

  merge<T>([ts, ...tss]: NonEmpty<T>[]): NonEmpty<T> {
    return NonEmpty.append(ts, ...tss.flatMap(NonEmpty.toArray));
  },

  map<A, B>([a, ...as]: NonEmpty<A>, f: (a: A) => B): NonEmpty<B> {
    return [f(a), ...as.map(f)];
  },

  isNonEmpty<T>(arr: T[]): arr is NonEmpty<T> {
    return arr.length > 0;
  },

  head<T>([t]: NonEmpty<T>): T {
    return t;
  },

  tail<T>([_t, ...ts]: NonEmpty<T>): T[] {
    return ts;
  },

  toArray<T>(t: NonEmpty<T>): T[] {
    return [...t];
  },
};
