export function runGenerator<T, TReturn, TArgs extends unknown[] = never[]>(
  f: Generator<T, TReturn> | ((...args: TArgs) => Generator<T, TReturn>),
  ...args: TArgs
): { values: T[]; result: TReturn } {
  const values: T[] = [];
  const gen = f instanceof Function ? f(...args) : f;
  while (true) {
    const { value, done } = gen.next();
    if (done) {
      return { values, result: value };
    }
    values.push(value);
  }
}
