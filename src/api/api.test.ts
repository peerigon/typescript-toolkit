import { describe, expect, it, vi } from "vitest";
import {
  defaultError,
  defaultFetch,
  defaultInit,
  defaultSuccess,
  defineApi,
  FetchError,
  type FetchOptions,
  type HttpMethod,
} from "./api.ts";

const baseUrl = "https://api.example.com";

const jsonResponse = (data: unknown, init?: ResponseInit) =>
  Response.json(data, { status: 200, ...init });

const captureFetch =
  (onCapture: (options: FetchOptions) => void) =>
  async (url: RequestInfo | URL, init?: RequestInit) => {
    onCapture({
      url: String(url),
      method: (init?.method ?? "GET") as HttpMethod,
      headers: new Headers(init?.headers),
      body: typeof init?.body === "string" ? init.body : undefined,
      signal: init?.signal ?? undefined,
    });
    return jsonResponse({});
  };

describe("defineApi()", () => {
  it("builds absolute URL from baseUrl, path, and query", async () => {
    let captured: FetchOptions | undefined;

    const api = defineApi("https://api.example.com/v1/", {
      fetch: async (url, init) => {
        captured = {
          url: String(url),
          method: (init?.method ?? "GET") as HttpMethod,
          headers: new Headers(init?.headers),
          body: typeof init?.body === "string" ? init.body : undefined,
          signal: init?.signal ?? undefined,
        };
        return jsonResponse({ ok: true });
      },
    });

    await api({
      url: "/users",
      method: "GET",
      query: { page: "1", q: "a b" },
    });

    expect(captured?.url).toBe("https://api.example.com/v1/users?page=1&q=a+b");
  });

  it("accepts URLSearchParams as query", async () => {
    let captured: FetchOptions | undefined;

    const api = defineApi(baseUrl, {
      fetch: captureFetch((options) => {
        captured = options;
      }),
    });

    await api({
      url: "/search",
      method: "GET",
      query: new URLSearchParams([
        ["tag", "a"],
        ["tag", "b"],
      ]),
    });

    expect(captured?.url).toBe("https://api.example.com/search?tag=a&tag=b");
  });

  it("serializes JSON body and sets Content-Type", async () => {
    let captured: FetchOptions | undefined;

    const api = defineApi(baseUrl, {
      fetch: async (url, init) => {
        captured = {
          url: String(url),
          method: (init?.method ?? "GET") as HttpMethod,
          headers: new Headers(init?.headers),
          body: typeof init?.body === "string" ? init.body : undefined,
          signal: init?.signal ?? undefined,
        };
        return jsonResponse({ id: 1 });
      },
    });

    await api({
      url: "/users",
      method: "POST",
      body: { name: "Ada" },
    });

    expect(captured?.body).toBe('{"name":"Ada"}');
    expect(captured?.headers.get("Content-Type")).toBe("application/json");
  });

  it("applies headers via defaultInit when composing init", async () => {
    let captured: FetchOptions | undefined;

    const api = defineApi(baseUrl, {
      init: defaultInit(baseUrl, {
        Authorization: "Bearer token",
        "X-Client": "toolkit",
      }),
      fetch: captureFetch((options) => {
        captured = options;
      }),
    });

    await api({ url: "/me", method: "GET" });

    expect(captured?.headers.get("Authorization")).toBe("Bearer token");
    expect(captured?.headers.get("X-Client")).toBe("toolkit");
  });

  it("applies a headers function via defaultInit", async () => {
    let captured: FetchOptions | undefined;

    const api = defineApi(baseUrl, {
      init: defaultInit(baseUrl, (input) => ({
        Authorization: "Bearer dynamic",
        "X-Method": input.method,
      })),
      fetch: captureFetch((options) => {
        captured = options;
      }),
    });

    await api({ url: "/me", method: "GET" });

    expect(captured?.headers.get("Authorization")).toBe("Bearer dynamic");
    expect(captured?.headers.get("X-Method")).toBe("GET");
  });

  it("does not overwrite an explicit Content-Type", async () => {
    let captured: FetchOptions | undefined;

    const api = defineApi(baseUrl, {
      init: defaultInit(baseUrl, {
        "Content-Type": "application/vnd.api+json",
      }),
      fetch: captureFetch((options) => {
        captured = options;
      }),
    });

    await api({
      url: "/users",
      method: "POST",
      body: { name: "Ada" },
    });

    expect(captured?.headers.get("Content-Type")).toBe(
      "application/vnd.api+json",
    );
  });

  it("forwards signal", async () => {
    let captured: FetchOptions | undefined;
    const controller = new AbortController();

    const api = defineApi(baseUrl, {
      fetch: captureFetch((options) => {
        captured = options;
      }),
    });

    await api({
      url: "/users",
      method: "GET",
      signal: controller.signal,
    });

    expect(captured?.signal).toBe(controller.signal);
  });

  it("parses JSON on success as unknown", async () => {
    const api = defineApi(baseUrl, {
      fetch: async () => jsonResponse({ id: 42 }),
    });

    await expect(api({ url: "/users/42", method: "GET" })).resolves.toEqual({
      id: 42,
    });
  });

  it("throws FetchError on non-ok responses", async () => {
    const api = defineApi(baseUrl, {
      fetch: async () =>
        new Response("nope", { status: 404, statusText: "Not Found" }),
    });

    const error = await api({ url: "/missing", method: "GET" }).catch(
      (error_: unknown) => error_,
    );

    expect(error).toBeInstanceOf(FetchError);
    expect(error).toMatchObject({
      status: 404,
      statusText: "Not Found",
      message: "Not Found",
    });
  });

  it("allows a custom fetch hook to intercept or delegate", async () => {
    const nativeFetch = vi.fn(defaultFetch);
    const intercepted: Array<string> = [];

    const api = defineApi(baseUrl, {
      fetch: async (url, init) => {
        const href = String(url);
        intercepted.push(href);

        if (href.endsWith("/cached")) {
          return jsonResponse({ source: "mock" });
        }

        return nativeFetch(url, init);
      },
    });

    await expect(api({ url: "/cached", method: "GET" })).resolves.toEqual({
      source: "mock",
    });
    expect(nativeFetch).not.toHaveBeenCalled();

    nativeFetch.mockResolvedValueOnce(jsonResponse({ source: "network" }));
    await expect(api({ url: "/live", method: "GET" })).resolves.toEqual({
      source: "network",
    });
    expect(nativeFetch).toHaveBeenCalledOnce();
    expect(intercepted).toHaveLength(2);
  });

  it("ignores baseUrl when a custom init is provided", async () => {
    let captured: FetchOptions | undefined;

    const api = defineApi("https://ignored.example.com", {
      init: () => ({
        url: "https://custom.example.com/x",
        method: "GET",
        headers: new Headers({ "X-Custom": "1" }),
      }),
      fetch: captureFetch((options) => {
        captured = options;
      }),
    });

    await api({ url: "/anything", method: "GET" });

    expect(captured?.url).toBe("https://custom.example.com/x");
    expect(captured?.headers.get("X-Custom")).toBe("1");
  });

  it("throws when url does not start with a slash", async () => {
    const api = defineApi(baseUrl, {
      fetch: async () => jsonResponse({}),
    });

    await expect(
      api({
        // @ts-expect-error — runtime guard for non-typed callers
        url: "users",
        method: "GET",
      }),
    ).rejects.toThrow(/url must start with "\/"/);
  });

  it("uses globalThis.fetch as defaultFetch", () => {
    expect(defaultFetch).toBe(globalThis.fetch);
  });
});

describe("default hooks", () => {
  it("defaultInit joins baseUrl without duplicating slashes", () => {
    const init = defaultInit("https://api.example.com/");

    expect(init({ url: "/users", method: "GET" }).url).toBe(
      "https://api.example.com/users",
    );
  });

  it("defaultError is a no-op for ok responses", async () => {
    await expect(defaultError(jsonResponse({}))).resolves.toBeUndefined();
  });

  it("defaultSuccess parses JSON", async () => {
    await expect(defaultSuccess(jsonResponse({ a: 1 }))).resolves.toEqual({
      a: 1,
    });
  });
});
