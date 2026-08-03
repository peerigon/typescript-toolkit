export type HttpMethod =
  | "GET"
  | "HEAD"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "OPTIONS"
  | "TRACE"
  | "CONNECT";

/** Compatible with DOM and undici `Headers` constructors (no DOM lib required). */
export type HeadersInit = NonNullable<ConstructorParameters<typeof Headers>[0]>;

export type FetchInput = {
  url: `/${string}`;
  method: HttpMethod;
  query?: ConstructorParameters<typeof URLSearchParams>[0] | URLSearchParams;
  body?: unknown;
  signal?: AbortSignal;
};

export type FetchOptions = {
  url: string;
  method: HttpMethod;
  headers: Headers;
  body?: string;
  signal?: AbortSignal;
};

export type DefineApiOptions = {
  init?: (input: FetchInput) => FetchOptions;
  fetch?: typeof globalThis.fetch;
  error?: (response: Response) => void | Promise<void>;
  success?: (response: Response) => Promise<unknown>;
};

/**
 * Define a typed JSON API client with a fixed hook pipeline:
 * `init` → `fetch` → `error` → `success`.
 *
 * Omit hooks to get JSON-API defaults. Override `fetch` in tests to intercept
 * requests (and optionally delegate to the real fetch).
 *
 * `baseUrl` is applied by the default `init`. A custom `init` owns URL construction.
 */
export const defineApi = (
  baseUrl: string,
  options: DefineApiOptions = {},
): ((input: FetchInput) => Promise<unknown>) => {
  const {
    init = defaultInit(baseUrl),
    fetch: fetchHook = defaultFetch,
    error: errorHook = defaultError,
    success: successHook = defaultSuccess,
  } = options;

  return async (input) => {
    if (!input.url.startsWith("/")) {
      throw new TypeError(
        `url must start with "/", got ${JSON.stringify(input.url)}`,
      );
    }

    const { url, method, headers, body, signal } = init(input);
    const response = await fetchHook(url, { method, headers, body, signal });

    await errorHook(response);

    return successHook(response);
  };
};

/**
 * Build the default JSON `init` hook for a `baseUrl`.
 * Pass `headers` (static or from `input`) when composing a custom `init`.
 */
export const defaultInit =
  (
    baseUrl: string,
    headersOption?: HeadersInit | ((input: FetchInput) => HeadersInit),
  ) =>
  (input: FetchInput): FetchOptions => {
    const headers = new Headers(
      typeof headersOption === "function"
        ? headersOption(input)
        : headersOption,
    );

    const body =
      input.body === undefined ? undefined : JSON.stringify(input.body);

    if (body !== undefined && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    return {
      url: buildUrl(baseUrl, input.url, input.query),
      method: input.method,
      headers,
      body,
      signal: input.signal,
    };
  };

export const defaultFetch = globalThis.fetch;

export const defaultError = async (response: Response): Promise<void> => {
  if (!response.ok) {
    throw new FetchError(response);
  }
};

export const defaultSuccess = async (response: Response): Promise<unknown> =>
  response.json();

export class FetchError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly response: Response;

  constructor(response: Response) {
    super(response.statusText || `HTTP ${response.status}`);
    this.name = "FetchError";
    this.status = response.status;
    this.statusText = response.statusText;
    this.response = response;
  }
}

const buildUrl = (
  baseUrl: string,
  path: string,
  query: FetchInput["query"],
): string => {
  let url = baseUrl.replace(/\/$/, "") + path;

  if (query !== undefined) {
    const params =
      query instanceof URLSearchParams ? query : new URLSearchParams(query);
    const search = params.toString();

    if (search) {
      url += `${url.includes("?") ? "&" : "?"}${search}`;
    }
  }

  return url;
};
