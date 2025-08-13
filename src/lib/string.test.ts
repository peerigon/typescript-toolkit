import { describe, expect, it } from "vitest";
import { stringify } from "./string.ts";

describe("stringify()", () => {
  describe("basic functionality", () => {
    it("stringifies primitive values", () => {
      expect(stringify("hello")).toMatchInlineSnapshot(`""hello""`);
      expect(stringify(42)).toMatchInlineSnapshot(`"42"`);
      expect(stringify(true)).toMatchInlineSnapshot(`"true"`);
      expect(stringify(false)).toMatchInlineSnapshot(`"false"`);
      expect(stringify(null)).toMatchInlineSnapshot(`"null"`);
      expect(stringify(undefined)).toMatchInlineSnapshot(`"undefined"`);
    });

    it("stringifies objects with default formatting", () => {
      const obj = { name: "John", age: 30 };
      expect(stringify(obj)).toMatchInlineSnapshot(
        `"{"name":"John","age":30}"`,
      );
    });

    it("stringifies arrays with default formatting", () => {
      const arr = [1, 2, 3, "test"];
      expect(stringify(arr)).toMatchInlineSnapshot(`"[1,2,3,"test"]"`);
    });

    it("handles nested structures", () => {
      const nested = {
        user: {
          name: "John",
          hobbies: ["reading", "coding"],
        },
        active: true,
      };
      expect(stringify(nested)).toMatchInlineSnapshot(
        `"{"user":{"name":"John","hobbies":["reading","codin…"`,
      );
    });
  });

  describe("options.limit", () => {
    it("uses default limit of 50 characters", () => {
      const longString =
        "This is a very long string that exceeds the default limit";
      expect(stringify(longString)).toMatchInlineSnapshot(
        `""This is a very long string that exceeds the defau…"`,
      );
    });

    it("respects custom limit", () => {
      const longString = "This is a very long string";
      expect(stringify(longString, { limit: 10 })).toMatchInlineSnapshot(
        `""This is a…"`,
      );
    });

    it("does not truncate when under limit", () => {
      const shortString = "Short";
      expect(stringify(shortString, { limit: 10 })).toMatchInlineSnapshot(
        `""Short""`,
      );
    });

    it("handles limit of 0", () => {
      const data = "Any string";
      expect(stringify(data, { limit: 0 })).toMatchInlineSnapshot(`""`);
    });

    it("handles very small limits", () => {
      const data = "Hello world";
      expect(stringify(data, { limit: 3 })).toMatchInlineSnapshot(`""He…"`);
    });

    it("truncates complex objects", () => {
      const complexObj = {
        name: "John Doe",
        age: 30,
        email: "john.doe@example.com",
        address: {
          street: "123 Main St",
          city: "Anytown",
          country: "USA",
        },
      };
      expect(stringify(complexObj, { limit: 30 })).toMatchInlineSnapshot(
        `"{"name":"John Doe","age":30,"e…"`,
      );
    });
  });

  describe("fallback behavior", () => {
    it("falls back to String() for circular references", () => {
      const circular: any = { name: "test" };
      circular.self = circular;

      expect(stringify(circular)).toMatchInlineSnapshot(`"[object Object]"`);
    });

    it("falls back to String() for objects with toJSON that throws", () => {
      const objWithBadToJSON = {
        name: "test",
        toJSON: () => {
          throw new Error("Bad toJSON");
        },
      };

      expect(stringify(objWithBadToJSON)).toMatchInlineSnapshot(
        `"[object Object]"`,
      );
    });

    it("falls back to String() for BigInt", () => {
      const bigInt = BigInt(123);
      expect(stringify(bigInt)).toMatchInlineSnapshot(`"123"`);
    });
  });

  describe("edge cases", () => {
    it("handles empty objects", () => {
      expect(stringify({})).toMatchInlineSnapshot(`"{}"`);
    });

    it("handles empty arrays", () => {
      expect(stringify([])).toMatchInlineSnapshot(`"[]"`);
    });

    it("handles objects with undefined values", () => {
      const obj = { name: "John", age: undefined };
      expect(stringify(obj)).toMatchInlineSnapshot(`"{"name":"John"}"`);
    });

    it("handles objects with null values", () => {
      const obj = { name: "John", age: null };
      expect(stringify(obj)).toMatchInlineSnapshot(
        `"{"name":"John","age":null}"`,
      );
    });

    it("handles functions", () => {
      const fn = () => "test";
      expect(stringify(fn)).toMatchInlineSnapshot(`"() => "test""`);
    });

    it("handles objects with symbol keys", () => {
      const symbol = Symbol("key");
      const obj = { [symbol]: "value", name: "John" };
      expect(stringify(obj)).toMatchInlineSnapshot(`"{"name":"John"}"`);
    });

    it("handles Date objects", () => {
      const date = new Date("2023-01-01T00:00:00.000Z");
      expect(stringify(date)).toMatchInlineSnapshot(
        `""2023-01-01T00:00:00.000Z""`,
      );
    });

    it("handles RegExp objects", () => {
      const regex = /test/g;
      expect(stringify(regex)).toMatchInlineSnapshot(`"{}"`);
    });

    it("handles Map objects", () => {
      const map = new Map([["key", "value"]]);
      expect(stringify(map)).toMatchInlineSnapshot(`"{}"`);
    });

    it("handles Set objects", () => {
      const set = new Set([1, 2, 3]);
      expect(stringify(set)).toMatchInlineSnapshot(`"{}"`);
    });

    it("handles Error objects", () => {
      const error = new Error("Test error");
      expect(stringify(error)).toMatchInlineSnapshot(`"{}"`);
    });

    it("handles objects with getters", () => {
      const obj = {
        get computed() {
          return "computed value";
        },
        regular: "regular value",
      };
      expect(stringify(obj)).toMatchInlineSnapshot(
        `"{"computed":"computed value","regular":"regular va…"`,
      );
    });

    it("handles objects with non-enumerable properties", () => {
      const obj = { name: "John" };
      Object.defineProperty(obj, "hidden", {
        value: "hidden value",
        enumerable: false,
      });
      expect(stringify(obj)).toMatchInlineSnapshot(`"{"name":"John"}"`);
    });
  });

  describe("unicode and special characters", () => {
    it("handles unicode characters", () => {
      expect(stringify("ñame")).toMatchInlineSnapshot(`""ñame""`);
      expect(stringify("über")).toMatchInlineSnapshot(`""über""`);
      expect(stringify("café")).toMatchInlineSnapshot(`""café""`);
    });

    it("handles emoji", () => {
      expect(stringify("Hello 👋")).toMatchInlineSnapshot(`""Hello 👋""`);
      expect(stringify("🚀 rocket")).toMatchInlineSnapshot(`""🚀 rocket""`);
    });

    it("handles control characters", () => {
      expect(stringify("line1\nline2")).toMatchInlineSnapshot(
        `""line1\\nline2""`,
      );
      expect(stringify("tab\there")).toMatchInlineSnapshot(`""tab\\there""`);
    });

    it("handles quotes and escaping", () => {
      expect(stringify('He said "Hello"')).toMatchInlineSnapshot(
        `""He said \\"Hello\\"""`,
      );
      expect(stringify("It's a test")).toMatchInlineSnapshot(`""It's a test""`);
    });
  });
});
