import { describe, expect, expectTypeOf, it } from "vitest";
import {
  mapLeaves,
  type Leaves,
  type MapLeavesResult,
  type ReplaceLeaves,
} from "./map-leaves.ts";

describe("mapLeaves()", () => {
  it("maps a root leaf", () => {
    expect(mapLeaves(null, () => undefined)).toBe(undefined);
    expect(mapLeaves(1, (leaf) => leaf + 1)).toBe(2);
  });

  it("maps leaves in arrays in place", () => {
    const input = [1, null, "a"];
    const output = mapLeaves(input, (leaf) => leaf ?? undefined);

    expect(output).toBe(input);
    expect(output).toEqual([1, undefined, "a"]);
  });

  it("maps leaves in plain objects in place", () => {
    const input = { name: null, age: 30 };
    const output = mapLeaves(input, (leaf) => leaf ?? undefined);

    expect(output).toBe(input);
    expect(output).toEqual({ name: undefined, age: 30 });
  });

  it("maps leaves deeply in nested structures", () => {
    const tags = ["admin", null];
    const user = { name: null, tags };
    const input = { user, meta: null };

    const output = mapLeaves(input, (leaf) => leaf ?? undefined);

    expect(output).toBe(input);
    expect(output.user).toBe(user);
    expect(output.user.tags).toBe(tags);
    expect(output).toEqual({
      user: {
        name: undefined,
        tags: ["admin", undefined],
      },
      meta: undefined,
    });
  });

  it("does not recurse into non-plain objects", () => {
    const date = new Date("2020-01-01");
    const calls: Array<unknown> = [];

    const output = mapLeaves({ date }, (leaf) => {
      calls.push(leaf);
      return leaf;
    });

    expect(output.date).toBe(date);
    expect(calls).toEqual([date]);
  });

  it("does not call map for containers", () => {
    const calls: Array<unknown> = [];

    mapLeaves({ tags: [1, 2] }, (leaf) => {
      calls.push(leaf);
      return leaf;
    });

    expect(calls).toEqual([1, 2]);
  });

  it("supports Object.create(null) plain objects", () => {
    const input = Object.assign(Object.create(null), { name: null });

    mapLeaves(input, (leaf) => leaf ?? undefined);

    expect(input.name).toBe(undefined);
  });

  it("handles circular object references", () => {
    const input: { name: null | undefined; self?: unknown } = { name: null };
    input.self = input;

    const output = mapLeaves(input, (leaf) => leaf ?? undefined);

    expect(output).toBe(input);
    expect(output.name).toBe(undefined);
    expect(output.self).toBe(input);
  });

  it("handles circular array references", () => {
    const input: Array<unknown> = [null];
    input.push(input);

    const output = mapLeaves(input, (leaf) => leaf ?? undefined);

    expect(output).toBe(input);
    expect(output[0]).toBe(undefined);
    expect(output[1]).toBe(input);
  });

  it("maps shared subtrees once", () => {
    const shared = { value: null };
    const input = { a: shared, b: shared };
    const calls: Array<unknown> = [];

    mapLeaves(input, (leaf) => {
      calls.push(leaf);
      return leaf ?? undefined;
    });

    expect(calls).toEqual([null]);
    expect(shared.value).toBe(undefined);
    expect(input.a).toBe(shared);
    expect(input.b).toBe(shared);
  });

  it("types the leaf callback from the input", () => {
    mapLeaves({ name: null as string | null, age: 30 }, (leaf) => {
      expectTypeOf(leaf).toEqualTypeOf<string | number | null>();
      return leaf;
    });
  });

  it("keeps the input type for identity-style maps", () => {
    const input = { a: 1 as const, b: "x" as const };
    expectTypeOf(mapLeaves(input, (leaf) => leaf)).toEqualTypeOf<
      typeof input
    >();
  });

  it("remaps leaf types when the mapper widens them", () => {
    const input: { name: null; age: 30 } = { name: null, age: 30 };

    expectTypeOf(mapLeaves(input, (leaf) => leaf ?? undefined)).toEqualTypeOf<{
      name: 30 | undefined;
      age: 30 | undefined;
    }>();
  });
});

describe("Leaves", () => {
  it("collects nested leaf types", () => {
    expectTypeOf<
      Leaves<{ name: string | null; tags: Array<boolean | null> }>
    >().toEqualTypeOf<string | boolean | null>();
    expectTypeOf<Leaves<{ date: Date; n: number }>>().toEqualTypeOf<
      Date | number
    >();
  });
});

describe("ReplaceLeaves", () => {
  it("replaces matching leaves and preserves structure", () => {
    expectTypeOf<
      ReplaceLeaves<null, null, undefined>
    >().toEqualTypeOf<undefined>();
    expectTypeOf<
      ReplaceLeaves<
        { name: string | null; tags: Array<boolean | null> },
        null,
        undefined
      >
    >().toEqualTypeOf<{
      name: string | undefined;
      tags: Array<boolean | undefined>;
    }>();
    expectTypeOf<ReplaceLeaves<Date, null, undefined>>().toEqualTypeOf<Date>();
  });
});

describe("MapLeavesResult", () => {
  it("keeps Value when MappedLeaf is within Leaves", () => {
    expectTypeOf<MapLeavesResult<{ a: 1; b: "x" }, 1 | "x">>().toEqualTypeOf<{
      a: 1;
      b: "x";
    }>();
  });

  it("remaps all leaves when MappedLeaf is outside Leaves", () => {
    expectTypeOf<
      MapLeavesResult<{ name: null; age: 30 }, 30 | undefined>
    >().toEqualTypeOf<{ name: 30 | undefined; age: 30 | undefined }>();
  });
});
