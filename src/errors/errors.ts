const domain = (domainId: string) => {
  return {
    id: domainId,
    class: <
      FullContext extends Record<string, unknown> = Record<string, never>,
      StaticContextKeys extends keyof FullContext = never,
    >(
      name: string,
      staticOptions: {
        message: string | ((params: { context: FullContext }) => string);
        context?: StaticContextKeys extends never
          ? never
          : {
              [Key in StaticContextKeys]: FullContext[Key];
            };
      },
    ) => {
      type RuntimeContext = keyof FullContext extends StaticContextKeys
        ? Record<string, never>
        : Omit<FullContext, StaticContextKeys>;

      return class StructuredError extends Error {
        constructor(
          ...args: RuntimeContext extends Record<string, never>
            ?
                | []
                | [
                    ErrorOptions & {
                      context: never;
                    },
                  ]
            : [ErrorOptions & { context: RuntimeContext | undefined }]
        ) {
          const { context: runtimeContext, ...errorOptions } = args[0] ?? {};
          const fullContext = {
            ...staticOptions.context,
            ...runtimeContext,
          } as FullContext; // Can we get rid of the type assertion?
          const message =
            typeof staticOptions.message === "string"
              ? staticOptions.message
              : staticOptions.message({
                  context: fullContext,
                });

          super(message, errorOptions);

          const code = `${domainId}/${name}`;
          const stack = super.stack ?? STACK_NOT_AVAILABLE;

          this.name = name;
          this.stack = stack;
          this.#json = {
            code,
            name,
            message,
            stack,
            context: fullContext,
          };
        }

        override readonly stack: string;

        // False positive, the field is used in the toJSON method
        // oxlint-disable-next-line no-unused-private-class-members
        #json: ErrorJson<FullContext>;

        get code() {
          return this.#json.code;
        }

        get context() {
          return this.#json.context;
        }

        toJSON(): ErrorJson<FullContext> {
          return {
            ...this.#json,
            // Do not persist potentially sensitive data by default
            context: undefined,
            stack: STACK_NOT_AVAILABLE,
          };
        }
      };
    },
  };
};

export const errors = {
  domain,
};

export type ErrorJson<Context extends Record<string, unknown>> = {
  name: string;
  message: string;
  code: string;
  stack: string;
  context: Context | undefined;
};

export type ContextWithHttpResponse = {
  http: Pick<Response, "status">;
};

const STACK_NOT_AVAILABLE = "Not available";

// type SplitContext<
//   FullContext extends Record<string, unknown>,
//   StaticContextKey extends keyof FullContext = never,
// > = {
//   FullContext: FullContext;
//   StaticContext: {
//     [K in StaticContextKey]: FullContext[K];
//   };
//   RuntimeContext: keyof FullContext extends StaticContextKey
//     ? never
//     : Omit<FullContext, StaticContextKey>;
// };

// type Bla = keyof Record<string, unknown>;

// type SplitContextResult = SplitContext<Record<string, unknown>>;

// type RuntimeContext = SplitContextResult["RuntimeContext"];
