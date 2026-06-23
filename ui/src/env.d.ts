declare module "csstype" {
  interface Properties {
    [k: `--${string}`]: string | number | undefined;
  }
}

export {};
