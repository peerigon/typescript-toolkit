import { describe, expect, it } from "vitest";
import { match } from "./match.ts";

describe("match()", () => {
  it("matches string, number, and symbol values", () => {
    // String match
    const stringValue = "A";
    const stringResult = match(stringValue, {
      A: "result A",
    });
    expect(stringResult).toBe("result A");

    // Number match
    const numberValue = 1;
    const numberResult = match(numberValue, {
      1: "one",
    });
    expect(numberResult).toBe("one");

    // Symbol match
    const sym1 = Symbol("one");
    const symbolResult = match(sym1, {
      [sym1]: "symbol one",
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
    const result = match(
      A,
      // @ts-expect-error Should show a type error here because match.catch does not free us from specifying all cases
      {
        [match.catch]: "unknown runtime value",
      },
    );
    expect(result).toBe("unknown runtime value");
  });
});
