import { describe, expect, it } from "vitest";
import { FetchError } from "../api.ts";
import { defineApiResult } from "./result.ts";

const baseUrl = "https://api.example.com";

describe("defineApiResult()", () => {
  it("returns Result.Success with parsed JSON", async () => {
    const api = defineApiResult(baseUrl, {
      fetch: async () => Response.json({ id: 1 }),
    });

    const outcome = await api({ url: "/users/1", method: "GET" });

    expect(outcome).toMatchObject({
      isSuccess: true,
      isError: false,
      data: { id: 1 },
      error: null,
    });
  });

  it("returns Result.Error for HTTP failures", async () => {
    const api = defineApiResult(baseUrl, {
      fetch: async () =>
        new Response("nope", { status: 404, statusText: "Not Found" }),
    });

    const outcome = await api({ url: "/missing", method: "GET" });

    expect(outcome.isError).toBe(true);
    expect(outcome).toMatchObject({
      isSuccess: false,
      isError: true,
      error: expect.any(FetchError),
    });
    expect(outcome.error).toMatchObject({
      status: 404,
      statusText: "Not Found",
    });
  });

  it("returns Result.Error when the fetch hook throws", async () => {
    const api = defineApiResult(baseUrl, {
      fetch: async () => {
        throw new TypeError("network down");
      },
    });

    const outcome = await api({ url: "/users", method: "GET" });

    expect(outcome).toMatchObject({
      isSuccess: false,
      isError: true,
      error: expect.any(TypeError),
    });
    expect(outcome.error?.message).toBe("network down");
  });
});
