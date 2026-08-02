import { describe, expect, expectTypeOf, it } from "vitest";
import {
  NULL,
  nullToUndefined,
  undefinedToNull,
  type NullToUndefined,
  type UndefinedToNull,
} from "./no-null.ts";

describe("NULL", () => {
  it("is the null value", () => {
    expect(NULL).toBe(null);
  });

  it("is typed as null", () => {
    expectTypeOf(NULL).toEqualTypeOf<null>();
  });
});

describe("nullToUndefined()", () => {
  it("replaces null with undefined", () => {
    expect(nullToUndefined(null)).toBe(undefined);
  });

  it("leaves other primitives unchanged", () => {
    expect(nullToUndefined(undefined)).toBe(undefined);
    expect(nullToUndefined(true)).toBe(true);
    expect(nullToUndefined(false)).toBe(false);
    expect(nullToUndefined(0)).toBe(0);
    expect(nullToUndefined("hello")).toBe("hello");
  });

  it("replaces null in arrays", () => {
    expect(nullToUndefined([1, null, "a"])).toEqual([1, undefined, "a"]);
  });

  it("replaces null in plain objects", () => {
    expect(
      nullToUndefined({
        name: null,
        age: 30,
        active: true,
      }),
    ).toEqual({
      name: undefined,
      age: 30,
      active: true,
    });
  });

  it("replaces null deeply in nested structures", () => {
    expect(
      nullToUndefined({
        user: {
          name: null,
          tags: ["admin", null],
        },
        meta: null,
      }),
    ).toEqual({
      user: {
        name: undefined,
        tags: ["admin", undefined],
      },
      meta: undefined,
    });
  });

  it("leaves non-plain objects unchanged", () => {
    const date = new Date("2020-01-01");
    expect(nullToUndefined(date)).toBe(date);
  });

  it("mutates plain objects and arrays in place", () => {
    const tags = [null];
    const input = { tags };
    const output = nullToUndefined(input);

    expect(output).toBe(input);
    expect(output.tags).toBe(tags);
    expect(output).toEqual({ tags: [undefined] });
  });

  it("narrows null to undefined in the return type", () => {
    const value = null as string | null;
    expectTypeOf(nullToUndefined(value)).toEqualTypeOf<string | undefined>();
  });

  it("narrows nested object types", () => {
    const value = {
      name: null as string | null,
      tags: [null] as Array<string | null>,
    };

    expectTypeOf(nullToUndefined(value)).toEqualTypeOf<{
      name: string | undefined;
      tags: Array<string | undefined>;
    }>();
  });
});

describe("undefinedToNull()", () => {
  it("replaces undefined with null", () => {
    expect(undefinedToNull(undefined)).toBe(null);
  });

  it("leaves other primitives unchanged", () => {
    expect(undefinedToNull(null)).toBe(null);
    expect(undefinedToNull(true)).toBe(true);
    expect(undefinedToNull(false)).toBe(false);
    expect(undefinedToNull(0)).toBe(0);
    expect(undefinedToNull("hello")).toBe("hello");
  });

  it("replaces undefined in arrays", () => {
    expect(undefinedToNull([1, undefined, "a"])).toEqual([1, null, "a"]);
  });

  it("replaces undefined in plain objects", () => {
    expect(
      undefinedToNull({
        name: undefined,
        age: 30,
        active: true,
      }),
    ).toEqual({
      name: null,
      age: 30,
      active: true,
    });
  });

  it("replaces undefined deeply in nested structures", () => {
    expect(
      undefinedToNull({
        user: {
          name: undefined,
          tags: ["admin", undefined],
        },
        meta: undefined,
      }),
    ).toEqual({
      user: {
        name: null,
        tags: ["admin", null],
      },
      meta: null,
    });
  });

  it("leaves non-plain objects unchanged", () => {
    const date = new Date("2020-01-01");
    expect(undefinedToNull(date)).toBe(date);
  });

  it("mutates plain objects and arrays in place", () => {
    const tags = [undefined];
    const input = { tags };
    const output = undefinedToNull(input);

    expect(output).toBe(input);
    expect(output.tags).toBe(tags);
    expect(output).toEqual({ tags: [null] });
  });

  it("narrows undefined to null in the return type", () => {
    const value = undefined as string | undefined;
    expectTypeOf(undefinedToNull(value)).toEqualTypeOf<string | null>();
  });

  it("narrows nested object types", () => {
    const value = {
      name: undefined as string | undefined,
      tags: [undefined] as Array<string | undefined>,
    };

    expectTypeOf(undefinedToNull(value)).toEqualTypeOf<{
      name: string | null;
      tags: Array<string | null>;
    }>();
  });
});

describe("NullToUndefined", () => {
  it("maps null and nested structures at the type level", () => {
    expectTypeOf<NullToUndefined<null>>().toEqualTypeOf<undefined>();
    expectTypeOf<NullToUndefined<string | null>>().toEqualTypeOf<
      string | undefined
    >();
    expectTypeOf<
      NullToUndefined<{
        name: string | null;
        tags: Array<boolean | null>;
      }>
    >().toEqualTypeOf<{
      name: string | undefined;
      tags: Array<boolean | undefined>;
    }>();
    expectTypeOf<NullToUndefined<[string | null, number]>>().toEqualTypeOf<
      [string | undefined, number]
    >();
  });
});

describe("UndefinedToNull", () => {
  it("maps undefined and nested structures at the type level", () => {
    expectTypeOf<UndefinedToNull<undefined>>().toEqualTypeOf<null>();
    expectTypeOf<UndefinedToNull<string | undefined>>().toEqualTypeOf<
      string | null
    >();
    expectTypeOf<
      UndefinedToNull<{
        name: string | undefined;
        tags: Array<boolean | undefined>;
      }>
    >().toEqualTypeOf<{
      name: string | null;
      tags: Array<boolean | null>;
    }>();
    expectTypeOf<UndefinedToNull<[string | undefined, number]>>().toEqualTypeOf<
      [string | null, number]
    >();
  });
});
