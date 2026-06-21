import type * as CSS from "csstype";

declare module "csstype" {
  interface Properties {
    [k: `--${string}`]: string | number | undefined;
  }
}

export {};
