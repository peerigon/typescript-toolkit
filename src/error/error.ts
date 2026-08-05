import { namespace, type Namespace } from "../namespace/namespace.ts";
import {
  buildSerializedError,
  mergeContext,
  registry,
  restoreFromSnapshot,
  serialize,
  type Context,
  type DefinedErrorInstance,
  type SerializedError,
  type ToJSONOptions,
} from "./error.lib.ts";

const renameClass = (Class: object, name: string): void => {
  Object.defineProperty(Class, "name", { value: name, configurable: true });
};

export type {
  Context,
  DefinedErrorInstance,
  SerializedError,
  SerializeOptions,
  ToJSONOptions,
} from "./error.lib.ts";

type ContextInput<
  ErrorContext extends Context,
  Defaults extends Context,
> = Omit<ErrorContext, Extract<keyof Defaults, keyof ErrorContext>> &
  Partial<Pick<ErrorContext, Extract<keyof Defaults, keyof ErrorContext>>>;

export type DefineErrorOptions<
  ErrorContext extends Context,
  Defaults extends Partial<ErrorContext>,
> = {
  /** Define-time defaults, merged under domain defaults and runtime context. */
  context?: Defaults;
  /**
   * A static message, or a function that derives one from the merged
   * context. Needs an explicit parameter type annotation — TypeScript
   * cannot infer it from the sibling `context` property inside a batch
   * `define()` call (unannotated parameters would silently widen to `any`).
   */
  message: string | ((context: ErrorContext) => string);
};

// Using `any` here (rather than `Context, Partial<Context>`) is deliberate:
// constraining to concrete type arguments would check each entry's
// `message` against the widened `Context` parameter type, which fails
// contravariance and makes inference fall back to this constraint —
// losing each entry's specific keys and context shape entirely.
type DefineErrorOptionsRecord = Record<string, DefineErrorOptions<any, any>>;

type DefinedErrorRecord<
  DomainDefaults extends Context,
  Options extends DefineErrorOptionsRecord,
> = {
  [Key in keyof Options]: Options[Key] extends DefineErrorOptions<
    infer ErrorContext,
    infer Defaults
  >
    ? new (
        context: ContextInput<ErrorContext, DomainDefaults & Defaults>,
      ) => DefinedErrorInstance & { readonly context: ErrorContext }
    : never;
};

export type ErrorDomain<DomainDefaults extends Context = Context> = (new (
  message?: string,
) => Error) & {
  /** The fully qualified, namespaced code prefix for this domain. */
  readonly code: string;

  /**
   * Defines a nested sub-domain. Its code is namespaced under this domain's
   * code, and any `context` defaults given here are merged under this
   * domain's own defaults. Errors defined within the sub-domain are also
   * `instanceof` this domain.
   */
  domain: <SubDefaults extends Context = Record<string, never>>(
    name: string,
    options?: { context?: SubDefaults },
  ) => ErrorDomain<DomainDefaults & SubDefaults>;

  /**
   * Defines one or more concrete error classes within this domain, keyed by
   * code. Instances of the returned classes are also `instanceof` every
   * ancestor domain.
   */
  define: <Options extends DefineErrorOptionsRecord>(
    options: Options,
  ) => DefinedErrorRecord<DomainDefaults, Options>;
};

type ErrorBaseClass = new (message?: string) => Error;

const createDomain = <DomainDefaults extends Context>(
  name: string,
  namespaceNode: Namespace,
  defaults: DomainDefaults,
  ParentClass: ErrorBaseClass,
): ErrorDomain<DomainDefaults> => {
  const fullCode = namespaceNode.toString();

  class Domain extends ParentClass {
    static readonly code = fullCode;

    constructor(message?: string) {
      if (new.target === Domain) {
        throw new Error(
          `${name} is an abstract error domain and cannot be instantiated directly`,
        );
      }

      super(message);
    }

    toJSON(
      this: DefinedErrorInstance,
      options?: ToJSONOptions,
    ): SerializedError {
      return buildSerializedError(this, options);
    }

    static domain<SubDefaults extends Context = Record<string, never>>(
      subName: string,
      options: { context?: SubDefaults } = {},
    ): ErrorDomain<DomainDefaults & SubDefaults> {
      return createDomain(
        subName,
        namespaceNode.claim(subName),
        mergeContext(defaults, options.context) as DomainDefaults & SubDefaults,
        Domain,
      );
    }

    static define<Options extends DefineErrorOptionsRecord>(
      options: Options,
    ): DefinedErrorRecord<DomainDefaults, Options> {
      const result: Record<string, unknown> = {};

      for (const [code, errorOptions] of Object.entries(options)) {
        const errorNamespace = namespaceNode.claim(code);
        const errorFullCode = errorNamespace.toString();
        const defineDefaults = mergeContext(defaults, errorOptions.context);

        class DefinedError extends Domain {
          readonly code = errorFullCode;
          readonly context: Context;

          constructor(runtimeContext: Context) {
            const context = mergeContext(defineDefaults, runtimeContext);
            const message =
              typeof errorOptions.message === "function"
                ? (errorOptions.message as (context: Context) => string)(
                    context,
                  )
                : errorOptions.message;

            super(message);
            this.name = code;
            this.context = context;
          }
        }

        renameClass(DefinedError, code);
        registry.set(errorFullCode, DefinedError);

        result[code] = DefinedError;
      }

      return result as DefinedErrorRecord<DomainDefaults, Options>;
    }
  }

  renameClass(Domain, name);

  return Domain;
};

/**
 * A fallback error used by `parse()` when a serialized error's code isn't
 * registered (e.g. it came from a different service or an older version
 * that no longer defines it). It still carries every field from the
 * original snapshot.
 */
export class UnknownError extends Error {
  readonly code: string;
  readonly context: Context;

  constructor(serialized: SerializedError) {
    super(serialized.message);
    this.name = serialized.name || "UnknownError";
    this.code = serialized.code;
    this.context = serialized.context;
    this.stack = serialized.stack;
  }

  toJSON(options?: ToJSONOptions): SerializedError {
    return buildSerializedError(this, options);
  }
}

const claimedDomainNames = new Set<string>();

export type DomainOptions<DomainDefaults extends Context> = {
  context?: DomainDefaults;
  /**
   * The separator between this domain's namespace segments, and those of
   * its sub-domains and errors. Defaults to ".". Only settable at the root
   * domain — sub-domains always inherit their parent's separator.
   */
  separator?: string;
};

const defineDomain = <DomainDefaults extends Context = Record<string, never>>(
  name: string,
  options: DomainOptions<DomainDefaults> = {},
): ErrorDomain<DomainDefaults> => {
  if (claimedDomainNames.has(name)) {
    throw new Error(`Domain name ${JSON.stringify(name)} is already claimed`, {
      cause: { name },
    });
  }

  claimedDomainNames.add(name);

  return createDomain(
    name,
    namespace.define({ prefix: name, separator: options.separator }),
    (options.context ?? {}) as DomainDefaults,
    Error,
  );
};

const parse = (
  serialized: string | SerializedError,
): DefinedErrorInstance | UnknownError => {
  const parsedSerialized: SerializedError =
    typeof serialized === "string" ? JSON.parse(serialized) : serialized;
  const RegisteredErrorClass = registry.get(parsedSerialized.code);

  if (RegisteredErrorClass === undefined) {
    return new UnknownError(parsedSerialized);
  }

  return restoreFromSnapshot(RegisteredErrorClass, parsedSerialized);
};

/**
 * Utilities for defining namespaced, serializable error domains and error
 * classes.
 */
export const errors = {
  domain: defineDomain,
  parse,
  serialize,
};
