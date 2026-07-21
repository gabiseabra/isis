import z from "zod";

export type Path = string & { __type?: "path" };
export type LTree = string & { __type?: "ltree" };

export const Path = Object.assign(z.string() as z.ZodType<Path>, {
  toLTree(value: Path): LTree {
    return value.replace(/\//g, ".");
  },
  fromLTreeString(value: string): Path {
    return value.replace(/\./g, "/");
  },
  fromString(value: string): Path {
    return Path.safeParse(value).data ?? "";
  },
  trim(value: Path): Path {
    return value.replace(/(^\/)|(\/$)/, "");
  },
  split(value: Path): Path[] {
    return value.split("/").map(Path.fromString);
  },
  join(values: Path[]): Path {
    return values.map(Path.trim).join("/");
  },
  contains(_parent: Path, _child: Path) {
    const parent = Path.trim(_parent);
    const child = Path.trim(_child);

    return child === parent || child.startsWith(`${parent}/`);
  },
  parent(a: Path): Path {
    return Path.join(Path.split(Path.trim(a)).slice(0, -1));
  },
});
