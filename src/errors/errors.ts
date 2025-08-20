export type ErrorDomain = {
  id: string;
  class: <Context = Record<string, never>>(
    name: string,
    options: ErrorClassOptions<Context>,
  ) => ErrorClass<Context>;
};

export type ErrorClassOptions<Context> = {
  message: Context extends unknown
    ? string
    : (params: { context: Context }) => string;
  http?: {
    status: number;
  };
};

export type ErrorClass<Context = Record<string, never>> = new (
  params?: Context extends unknown ? undefined : { context: Context },
) => ErrorInstance<Context>;

export type ErrorInstance<Context = Record<string, never>> = Error & {
  code: string;
  name: string;
  message: string;
  context: Context;
  toJSON: () => ErrorJson;
  toHttpResponse: () => HttpErrorResponse;
};

export type ErrorJson = {
  code: string;
  name: string;
  message: string;
  stack?: string;
};

export type HttpErrorResponse = {
  status: number;
  body: ErrorJson;
};

const domain = (id: string): ErrorDomain => {
  return {
    id,
    class: <Context = Record<string, never>>(
      name: string,
      options: ErrorClassOptions<Context>,
    ): ErrorClass<Context> => {
      return class CustomError extends Error implements ErrorInstance<Context> {
        code: string;
        context: Context;

        constructor(
          params?: Context extends unknown ? undefined : { context: Context },
        ) {
          const message =
            typeof options.message === "string"
              ? options.message
              : (options.message as (params: { context: Context }) => string)({
                  context: (params as { context: Context }).context,
                });

          super(message);

          this.name = name;
          this.code = `${id}/${name}`;

          if (params && "context" in params) {
            this.context = params.context as Context extends unknown
              ? never
              : Context;
          } else {
            this.context = {} as Context;
          }

          // Ensure proper prototype chain
          Object.setPrototypeOf(this, new.target.prototype);
        }

        toJSON = (): ErrorJson => {
          return {
            code: this.code,
            name: this.name,
            message: this.message,
            stack: this.stack,
          };
        };

        toHttpResponse = (): HttpErrorResponse => {
          return {
            status: options.http?.status ?? 500,
            body: this.toJSON(),
          };
        };
      } as ErrorClass<Context>;
    },
  };
};

export const errors = {
  domain,
};
