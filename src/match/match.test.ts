import { describe, expect, it } from "vitest";
import { match } from "./match.ts";

describe("match()", () => {
  it("matches string, number, and symbol values", () => {
    // String match
    const stringValue = "A" as "A" | "B";
    const stringResult: "a" | "b" = match(stringValue, {
      A: "a",
      B: "b",
    });
    expect(stringResult).toBe("result A");

    // Number match
    const numberValue = 1 as 1 | 2;
    const numberResult: "one" | "two" = match(numberValue, {
      1: "one",
      2: "two",
    });
    expect(numberResult).toBe("one");

    // Symbol match
    const sym1 = Symbol("one");
    const sym2 = Symbol("two");
    const sym = sym1 as typeof sym1 | typeof sym2;
    const symbolResult: "symbol one" | "symbol two" = match(sym, {
      [sym1]: "symbol one",
      [sym2]: "symbol two",
    });
    expect(symbolResult).toBe("symbol one");
  });

  it("throws runtime error for missing case", () => {
    expect(() => {
      match("A", {
        // @ts-expect-error Should show a type error here
        B: "result B",
      });
    }).toThrow("No match found for A. Expected one of: B");
  });

  it("allows to define a default case", () => {
    const result = match("A", {
      // Should not show a type error here
      [match.default]: "default result",
    });
    expect(result).toBe("default result");
  });

  it("allows to define a catch case for unknown runtime values", () => {
    const A = "B" as "A";
    const result = match(A, {
      // @ts-expect-error Should show a type error here because match.catch does not free us from specifying all cases
      [match.catch]: "unknown runtime value",
    });
    expect(result).toBe("unknown runtime value");
  });
});
