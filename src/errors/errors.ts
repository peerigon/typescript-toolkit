const domain = (domainId: string) => {
  return {
    id: domainId,
    class: <
      const FullContext extends Record<string, unknown> = Record<string, never>,
      const StaticContextKey extends keyof FullContext = never,
    >(
      name: `${string}Error`,
      options: {
        message:
          | string
          | ((
              fullContext: FullContext,
              cause: ErrorOptions["cause"],
            ) => string);
        context?: {
          [Key in StaticContextKey]: FullContext[Key];
        };
      },
    ) => {
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
            ...options.context,
            ...runtimeContext,
          } as FullContext;

          const getMessage = options.message;
          const message: string =
            typeof getMessage === "function"
              ? getMessage(fullContext, errorOptions.cause)
              : getMessage;

          super(message, errorOptions);

          // Set the name before accessing stack to ensure it's included in the stack trace
          this.name = name;

          const stack = this.stack ?? STACK_NOT_AVAILABLE;
          const code = `${domainId}/${name}`;

          this.#json = {
            code,
            name,
            message,
            stack,
            context: fullContext,
          };
        }

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
