const domain = (domainId: string) => {
  return {
    id: domainId,
    class: (name: string) => {
      const define = <
        // const StaticContext extends Record<string, unknown> = Record<
        //   string,
        //   never
        // >,
        const FullContext extends Record<string, unknown> = Record<
          string,
          never
        >,
        const StaticContextKey extends keyof FullContext = never,
      >(staticOptions: {
        message:
          | string
          | ((
              fullContext: FullContext,
              cause: ErrorOptions["cause"],
            ) => string);
        context?: {
          [Key in StaticContextKey]: FullContext[Key];
        };
      }) => {
        type RuntimeContext = Omit<FullContext, StaticContextKey>;

        return class StructuredError extends Error {
          constructor(
            ...args: Record<string, never> extends RuntimeContext
              ?
                  | []
                  | [
                      ErrorOptions & {
                        context?: never;
                      },
                    ]
              : [ErrorOptions & { context: RuntimeContext | undefined }]
          ) {
            const { context: runtimeContext, ...errorOptions } = args[0] ?? {
              cause: undefined,
            };

            const fullContext = {
              ...staticOptions.context,
              ...runtimeContext,
            } as FullContext;

            const getMessage = staticOptions.message;
            const message: string =
              typeof getMessage === "function"
                ? getMessage(fullContext, errorOptions.cause)
                : getMessage;

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
      };

      return {
        define,
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
