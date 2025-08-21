const domain = (domainId: string) => {
  return {
    id: domainId,
    class: <
      FullContext extends Record<string, unknown>,
      StaticContextKeys extends keyof FullContext = never,
    >(
      name: string,
      options: {
        message: string | ((params: { context: FullContext }) => string);
        context?: {
          [Key in StaticContextKeys]: FullContext[Key];
        };
      },
    ) => {
      type RuntimeContext = keyof FullContext extends StaticContextKeys
        ? never
        : Omit<FullContext, StaticContextKeys>;

      return class CustomError extends Error {
        code: string;
        context: FullContext;

        constructor(
          params?: RuntimeContext extends never
            ? undefined
            : { context: RuntimeContext },
        ) {
          const mergedContext = {
            ...options.context,
            ...params?.context,
          } as FullContext; // Can we get rid of the type assertion?

          const message =
            typeof options.message === "string"
              ? options.message
              : options.message({
                  context: mergedContext,
                });

          super(message);

          this.name = name;
          this.code = `${domainId}/${name}`;
          this.context = mergedContext;
        }

        toJSON = (): ErrorJson => {
          return {
            code: this.code,
            name: this.name,
            message: this.message,
            stack: this.stack,
          };
        };
      };
    },
  };
};

export const errors = {
  domain,
};

export type ErrorJson = {
  code: string;
  name: string;
  message: string;
  stack?: string;
};

export type ContextWithHttpResponse = {
  http: Pick<Response, "status">;
};

type SplitContext<
  FullContext extends Record<string, unknown>,
  StaticContextKeys extends keyof FullContext = never,
> = {
  FullContext: FullContext;
  StaticContext: {
    [K in StaticContextKeys]: FullContext[K];
  };
  RuntimeContext: keyof FullContext extends StaticContextKeys
    ? never
    : Omit<FullContext, StaticContextKeys>;
};

type Bla = SplitContext<
  {
    a: string;
    b: number;
  },
  "a" | "b"
>;

type RuntimeContext = Bla["RuntimeContext"];
