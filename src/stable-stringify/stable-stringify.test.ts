import { describe, expect, expectTypeOf, it } from "vitest";
import {
  stableStringify,
  type StableStringifyValue,
} from "./stable-stringify.ts";

describe("stableStringify()", () => {
  it("sorts object keys deterministically", () => {
    expect(stableStringify({ page: 1, status: "active" })).toBe(
      stableStringify({ status: "active", page: 1 }),
    );
    expect(stableStringify({ page: 1, status: "active" })).toBe(
      '{"page":1,"status":"active"}',
    );
  });

  it("omits undefined object properties", () => {
    expect(stableStringify({ a: 1, b: undefined })).toBe(
      stableStringify({ a: 1 }),
    );
    expect(stableStringify({ a: 1, b: undefined })).toBe('{"a":1}');
  });

  it("preserves array order", () => {
    expect(stableStringify(["a", "b"])).not.toBe(stableStringify(["b", "a"]));
    expect(stableStringify(["a", "b"])).toBe('["a","b"]');
  });

  it("sorts nested object keys", () => {
    expect(
      stableStringify({
        z: { b: 2, a: 1 },
        a: { y: 4, x: 3 },
      }),
    ).toBe('{"a":{"x":3,"y":4},"z":{"a":1,"b":2}}');
  });

  it("stringifies JSON primitives", () => {
    expect(stableStringify(null)).toBe("null");
    expect(stableStringify(true)).toBe("true");
    expect(stableStringify(false)).toBe("false");
    expect(stableStringify(42)).toBe("42");
    expect(stableStringify("hello")).toBe('"hello"');
  });

  it("preserves number edge cases that JSON.stringify collapses", () => {
    expect(stableStringify(Number.NaN)).toBe("NaN");
    expect(stableStringify(Infinity)).toBe("Infinity");
    expect(stableStringify(-Infinity)).toBe("-Infinity");
    expect(stableStringify(-0)).toBe("-0");
    expect(stableStringify(0)).toBe("0");
  });

  it("stringifies BigInt", () => {
    expect(stableStringify(1n)).toBe("1n");
    expect(stableStringify({ id: 1n })).toBe('{"id":1n}');
  });

  it("stringifies Symbol", () => {
    expect(stableStringify(Symbol.for("x"))).toBe('Symbol.for("x")');
    expect(stableStringify(Symbol.iterator)).toBe("Symbol.iterator");
    expect(stableStringify(Symbol("desc"))).toBe('Symbol("desc")');
    expect(stableStringify(Symbol(""))).toBe('Symbol("")');
  });

  it("stringifies Map with sorted entries", () => {
    expect(
      stableStringify(
        new Map([
          ["b", 2],
          ["a", 1],
        ]),
      ),
    ).toBe('Map([["a",1],["b",2]])');
    expect(
      stableStringify(
        new Map([
          ["b", 2],
          ["a", 1],
        ]),
      ),
    ).toBe(
      stableStringify(
        new Map([
          ["a", 1],
          ["b", 2],
        ]),
      ),
    );
  });

  it("sorts Map entries by value when stringified keys tie", () => {
    const keyA = { id: 1 };
    const keyB = { id: 1 };
    expect(
      stableStringify(
        new Map([
          [keyA, "z"],
          [keyB, "a"],
        ]),
      ),
    ).toBe(
      stableStringify(
        new Map([
          [keyB, "a"],
          [keyA, "z"],
        ]),
      ),
    );
    expect(
      stableStringify(
        new Map([
          [keyA, "z"],
          [keyB, "a"],
        ]),
      ),
    ).toBe('Map([[{"id":1},"a"],[{"id":1},"z"]])');
  });

  it("stringifies Set with sorted values", () => {
    expect(stableStringify(new Set([2, 1, 3]))).toBe("Set([1,2,3])");
    expect(stableStringify(new Set([3, 1, 2]))).toBe(
      stableStringify(new Set([1, 2, 3])),
    );
  });

  it("stringifies nested Map and Set", () => {
    expect(stableStringify({ m: new Map([["a", new Set([2, 1])]]) })).toBe(
      '{"m":Map([["a",Set([1,2])]])}',
    );
  });

  it("stringifies Date and RegExp in constructor style", () => {
    const date = new Date("2020-01-01T00:00:00.000Z");
    expect(stableStringify(date)).toBe('Date("2020-01-01T00:00:00.000Z")');
    expect(stableStringify(/ab+c/gi)).toBe('RegExp("ab+c","gi")');
  });

  it("stringifies invalid Date as Date(NaN)", () => {
    expect(stableStringify(new Date(Number.NaN))).toBe("Date(NaN)");
    expect(stableStringify(new Date("not a date"))).toBe("Date(NaN)");
  });

  it("stringifies circular references as Circular(distanceUp)", () => {
    const selfCycle: { self?: StableStringifyValue } = {};
    selfCycle.self = selfCycle;
    expect(stableStringify(selfCycle)).toBe('{"self":Circular(1)}');

    const toRoot: {
      a?: { b?: StableStringifyValue };
      c?: number;
    } = { c: 1 };
    toRoot.a = { b: toRoot };
    expect(stableStringify(toRoot)).toBe('{"a":{"b":Circular(2)},"c":1}');

    const inner: { b?: StableStringifyValue; n: number } = { n: 1 };
    inner.b = inner;
    expect(stableStringify({ a: inner })).toBe('{"a":{"b":Circular(1),"n":1}}');

    // Different cycle targets must not collide.
    expect(stableStringify(toRoot)).not.toBe(stableStringify({ a: inner }));
  });

  it("stringifies shared non-circular refs twice", () => {
    const shared = { x: 1 };
    expect(stableStringify({ a: shared, b: shared })).toBe(
      '{"a":{"x":1},"b":{"x":1}}',
    );
  });

  it("sorts Object.create(null) keys", () => {
    const value = Object.create(null) as Record<string, number>;
    value["b"] = 2;
    value["a"] = 1;
    expect(stableStringify(value)).toBe('{"a":1,"b":2}');
  });

  it("throws on unexpected runtime values", () => {
    expect(() =>
      stableStringify(undefined as unknown as StableStringifyValue),
    ).toThrow(TypeError);
    expect(() =>
      stableStringify((() => undefined) as unknown as StableStringifyValue),
    ).toThrow(TypeError);
    expect(() =>
      stableStringify(new WeakMap() as unknown as StableStringifyValue),
    ).toThrow(TypeError);
    expect(() =>
      stableStringify(Promise.resolve(1) as unknown as StableStringifyValue),
    ).toThrow(TypeError);
  });

  it("rejects unsupported types at compile time", () => {
    expectTypeOf(stableStringify)
      .parameter(0)
      .toEqualTypeOf<StableStringifyValue>();

    // Type-only checks — never invoked at runtime
    const typeChecks = () => {
      // @ts-expect-error — undefined is not a StableStringifyValue
      stableStringify(undefined);

      // @ts-expect-error — functions are not serializable
      stableStringify(() => undefined);

      // @ts-expect-error — WeakMap is not serializable
      stableStringify(new WeakMap());

      // @ts-expect-error — Promise is not serializable
      stableStringify(Promise.resolve(1));
    };

    expectTypeOf(typeChecks).toBeFunction();
  });
});
