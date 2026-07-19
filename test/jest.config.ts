/** @jest-config-loader ts-node */
/** @jest-config-loader-options {"transpileOnly": true} */
import * as fs from "fs";
import type { Config } from "jest";
import * as path from "path";
import workspaces from "../tsconfig.json";

const projectRoot = path.resolve(__dirname, "..");

export default {
  projects: workspaces.references.map(
    (ref): Config => ({
      displayName: path.basename(ref.path),
      rootDir: process.cwd(),
      testEnvironment: "node",
      testMatch: [
        path.join(projectRoot, ref.path, `/src/**/*.test.ts`),
        path.join(projectRoot, ref.path, `/src/**/*.test.tsx`),
        path.join(projectRoot, ref.path, `/src/**/*.spec.ts`),
        path.join(projectRoot, ref.path, `/src/**/*.spec.tsx`),
      ],
      transform: {
        "^.+\\.tsx?$": [
          "ts-jest",
          {
            useESM: false,
            tsconfig: resolveTsconfig(path.basename(ref.path)),
            diagnostics: false,
          },
        ],
        "^.+\\.mjs$": [
          "babel-jest",
          {
            plugins: ["@babel/plugin-transform-modules-commonjs"],
          },
        ],
      },
      transformIgnorePatterns: ["/node_modules/(?!@orpc/)"],
      moduleNameMapper: {
        "\\.(css|scss|sass)$": "identity-obj-proxy",
      },
      setupFiles: [`${projectRoot}/test/jest/setup.ts`],
      setupFilesAfterEnv: [
        "@testing-library/jest-dom",
        `${projectRoot}/test/jest/setup-after-env.ts`,
      ],
    }),
  ),
};

function resolveTsconfig(workspace: string) {
  const workspaceRoot = `${projectRoot}/${workspace}`;
  return fs.existsSync(`${workspaceRoot}/tsconfig.build.json`)
    ? `${workspaceRoot}/tsconfig.build.json`
    : `${workspaceRoot}/tsconfig.json`;
}
