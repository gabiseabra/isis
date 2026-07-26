import type { Properties } from "csstype";

type BaseCSSValue = string | number;

export type CSSProperty = keyof Properties;

export type CSSValue<T extends BaseCSSValue = BaseCSSValue> = T & {
  __type?: "CSSValue";
};

export const CSSValue = {
  var(varName: `--${string}`): CSSValue {
    return `var(${varName})`;
  },
  calc(expression: BaseCSSValue): CSSValue {
    return `calc(${expression})`;
  },
};
