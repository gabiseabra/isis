import { jest } from "@jest/globals";

global.fetch = () => {
  throw new Error("fetch not implemented");
};

global.jest = jest;
