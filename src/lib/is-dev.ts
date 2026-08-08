type ImportMetaWithEnv = {
  readonly env?: {
    readonly DEV?: boolean;
  };
};

/**
 * Whether we're running in a dev environment. `true` only when a bundler's
 * `import.meta.env.DEV` or Node's `process.env.NODE_ENV` explicitly says so;
 * `false` in every other case. Evaluated once at module load, so
 * `import.meta.env.DEV` can be statically replaced and dead-code-eliminated
 * by bundlers.
 */
export const isDev: boolean =
  (import.meta as ImportMetaWithEnv).env?.DEV === true ||
  (typeof process !== "undefined" && process.env["NODE_ENV"] === "development");
