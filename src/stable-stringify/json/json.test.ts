import { describe, expect, expectTypeOf, it } from "vitest";
import { stableJsonStringify, type JsonValue } from "./json.ts";

describe("stableJsonStringify()", () => {
  it("sorts object keys deterministically", () => {
    expect(stableJsonStringify({ page: 1, status: "active" })).toBe(
      stableJsonStringify({ status: "active", page: 1 }),
    );
    expect(stableJsonStringify({ page: 1, status: "active" })).toBe(
      '{"page":1,"status":"active"}',
    );
  });

  it("omits undefined object properties", () => {
    expect(stableJsonStringify({ a: 1, b: undefined })).toBe(
      stableJsonStringify({ a: 1 }),
    );
    expect(stableJsonStringify({ a: 1, b: undefined })).toBe('{"a":1}');
  });

  it("preserves array order", () => {
    expect(stableJsonStringify(["a", "b"])).not.toBe(
      stableJsonStringify(["b", "a"]),
    );
    expect(stableJsonStringify(["a", "b"])).toBe('["a","b"]');
  });

  it("sorts nested object keys", () => {
    expect(
      stableJsonStringify({
        z: { b: 2, a: 1 },
        a: { y: 4, x: 3 },
      }),
    ).toBe('{"a":{"x":3,"y":4},"z":{"a":1,"b":2}}');
  });

  it("stringifies JSON primitives", () => {
    expect(stableJsonStringify(null)).toBe("null");
    expect(stableJsonStringify(true)).toBe("true");
    expect(stableJsonStringify(false)).toBe("false");
    expect(stableJsonStringify(42)).toBe("42");
    expect(stableJsonStringify("hello")).toBe('"hello"');
  });

  it("sorts Object.create(null) keys", () => {
    const value = Object.create(null) as Record<string, number>;
    value["b"] = 2;
    value["a"] = 1;
    expect(stableJsonStringify(value)).toBe('{"a":1,"b":2}');
  });

  it("returns null when JSON.stringify would yield undefined", () => {
    const value = {
      toJSON: () => undefined,
    } as unknown as JsonValue;

    expect(stableJsonStringify(value)).toBe("null");
  });

  it("rejects unsupported types at compile time", () => {
    expectTypeOf(stableJsonStringify).parameter(0).toEqualTypeOf<JsonValue>();

    // Type-only checks — never invoked at runtime
    const typeChecks = () => {
      // @ts-expect-error — undefined is not a JsonValue
      stableJsonStringify(undefined);

      // @ts-expect-error — bigint is not JSON
      stableJsonStringify(1n);

      // @ts-expect-error — Date is not a JsonValue (use an ISO string)
      stableJsonStringify(new Date());

      // @ts-expect-error — Map is not JSON
      stableJsonStringify(new Map());
    };

    expectTypeOf(typeChecks).toBeFunction();
  });
});
