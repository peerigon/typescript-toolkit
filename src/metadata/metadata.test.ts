import { describe, expect, expectTypeOf, it } from "vitest";
import { metadata, type MetadataStore } from "./metadata.ts";

describe("metadata", () => {
  describe("define()", () => {
    it("returns a MetadataStore instance", () => {
      expectTypeOf(metadata.define<{ source: string }>()).toEqualTypeOf<
        MetadataStore<{ source: string }>
      >();
    });
  });

  describe("set() and get()", () => {
    it("stores and retrieves metadata on an object", () => {
      const store = metadata.define<{ source: string }>();
      const target = { ok: true };

      store.set(target, { source: "api" });

      expect(store.get(target)).toEqual({ source: "api" });
    });

    it("returns undefined when no metadata is set", () => {
      const store = metadata.define<{ source: string }>();

      expect(store.get({ ok: true })).toBeUndefined();
    });

    it("returns the target from set()", () => {
      const store = metadata.define<{ source: string }>();
      const target = { ok: true };

      expect(store.set(target, { source: "api" })).toBe(target);
    });

    it("returns Value | undefined from get()", () => {
      const store = metadata.define<{ source: string }>();
      const target = { ok: true };

      expectTypeOf(store.get(target)).toEqualTypeOf<
        { source: string } | undefined
      >();
    });
  });

  describe("has()", () => {
    it("returns true when metadata is set", () => {
      const store = metadata.define<{ source: string }>();
      const target = { ok: true };

      store.set(target, { source: "api" });

      expect(store.has(target)).toBe(true);
    });

    it("returns false when no metadata is set", () => {
      const store = metadata.define<{ source: string }>();

      expect(store.has({ ok: true })).toBe(false);
    });
  });

  describe("delete()", () => {
    it("removes metadata and returns true", () => {
      const store = metadata.define<{ source: string }>();
      const target = { ok: true };

      store.set(target, { source: "api" });

      expect(store.delete(target)).toBe(true);
      expect(store.has(target)).toBe(false);
      expect(store.get(target)).toBeUndefined();
    });

    it("returns false when no metadata is set", () => {
      const store = metadata.define<{ source: string }>();

      expect(store.delete({ ok: true })).toBe(false);
    });
  });

  describe("store isolation", () => {
    it("keeps metadata separate between different stores on the same object", () => {
      const resultMetadata = metadata.define<{ source: string }>();
      const traceMetadata = metadata.define<{ traceId: string }>();
      const target = { ok: true };

      resultMetadata.set(target, { source: "api" });
      traceMetadata.set(target, { traceId: "abc" });

      expect(resultMetadata.get(target)).toEqual({ source: "api" });
      expect(traceMetadata.get(target)).toEqual({ traceId: "abc" });
    });
  });
});
