import { isDev } from "../lib/is-dev.ts";

export type Context = Record<string, unknown>;

export type SerializedError = {
  code: string;
  name: string;
  message: string;
  context: Context;
  stack: string | undefined;
};

export type ToJSONOptions = {
  /** Whether to include the stack trace. Defaults to `serialize.includeStack`. */
  includeStack?: boolean;
};

export type SerializeOptions = {
  /**
   * Whether `toJSON()` includes the stack trace by default. Mutate this to
   * control it globally; defaults to `isDev`.
   */
  includeStack: boolean;
};

export const serialize: SerializeOptions = {
  includeStack: isDev,
};

export type DefinedErrorInstance = Error & {
  readonly code: string;
  readonly context: Context;
  toJSON: (options?: ToJSONOptions) => SerializedError;
};

type DefinedErrorConstructor = new (context: Context) => DefinedErrorInstance;

/**
 * Registered error classes by their fully qualified code, so `parse()` can
 * look them up later. Codes are guaranteed unique by the namespace claim
 * that produced them, so this never needs to guard against collisions
 * itself.
 */
export const registry = new Map<string, DefinedErrorConstructor>();

export const mergeContext = (
  ...sources: ReadonlyArray<Context | undefined>
): Context => Object.assign({}, ...sources) as Context;

/**
 * Builds the serializable snapshot of an error instance. The stack is only
 * included when `options.includeStack` is true, defaulting to
 * `serialize.includeStack` so that stack traces aren't leaked in production
 * by default.
 */
export const buildSerializedError = (
  instance: {
    code: string;
    name: string;
    message: string;
    context: Context;
    stack?: string;
  },
  { includeStack = serialize.includeStack }: ToJSONOptions = {},
): SerializedError => ({
  code: instance.code,
  name: instance.name,
  message: instance.message,
  context: instance.context,
  stack: includeStack ? instance.stack : undefined,
});

/**
 * Reconstructs an error instance from a serialized snapshot without
 * re-running the class's constructor logic (which would recompute the
 * message from merged context using whatever defaults are current, and
 * could drift from what was originally serialized). This guarantees an
 * exact round-trip regardless of code changes between serialize and
 * deserialize.
 */
export const restoreFromSnapshot = <ErrorClass extends DefinedErrorConstructor>(
  ErrorClassConstructor: ErrorClass,
  serialized: SerializedError,
): InstanceType<ErrorClass> => {
  const instance = Object.create(
    ErrorClassConstructor.prototype,
  ) as InstanceType<ErrorClass>;

  Object.assign(instance, {
    name: serialized.name,
    message: serialized.message,
    stack: serialized.stack,
    code: serialized.code,
    context: serialized.context,
  });

  return instance;
};
