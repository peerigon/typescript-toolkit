declare global {
  // Declaration merging requires an interface here, not a type alias.
  /* eslint-disable @typescript-eslint/consistent-type-definitions */
  interface ImportMetaEnv {
    readonly DEV?: boolean;
  }

  interface ImportMeta {
    readonly env?: ImportMetaEnv;
  }
  /* eslint-enable @typescript-eslint/consistent-type-definitions */
}

/**
 * Whether we're running in a dev environment. `true` only when a bundler's
 * `import.meta.env.DEV` or Node's `process.env.NODE_ENV` explicitly says so;
 * `false` in every other case. Evaluated once at module load, so
 * `import.meta.env.DEV` can be statically replaced and dead-code-eliminated
 * by bundlers.
 */
export const isDev: boolean =
  import.meta.env?.DEV === true ||
  (typeof process !== "undefined" && process.env["NODE_ENV"] === "development");
