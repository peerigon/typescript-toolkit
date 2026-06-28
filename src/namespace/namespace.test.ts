import { describe, expect, expectTypeOf, it } from "vitest";
import { namespace, type Namespace } from "./namespace.ts";

describe("namespace", () => {
  describe("define()", () => {
    it("creates a root namespace with an empty prefix", () => {
      const root = namespace.define();

      expect(root.toString()).toBe("");
    });

    it("returns a Namespace instance", () => {
      expectTypeOf(namespace.define()).toEqualTypeOf<Namespace>();
    });

    it("accepts a string prefix", () => {
      const root = namespace.define({ prefix: "app" });

      expect(root.toString()).toBe("app");
    });

    it("joins array prefixes with the separator", () => {
      const root = namespace.define({
        prefix: ["app", "v1"],
        separator: "/",
      });

      expect(root.toString()).toBe("app/v1");
    });

    it("uses a custom separator when claiming members", () => {
      const root = namespace.define({ separator: "/" });
      const child = root.claim("a").claim("b");

      expect(child.toString()).toBe("a/b");
    });
  });

  describe("claim()", () => {
    it("returns a child namespace with the joined prefix", () => {
      const root = namespace.define();
      const a = root.claim("a");
      const ab = a.claim("b");

      expect(a.toString()).toBe("a");
      expect(ab.toString()).toBe("a.b");
    });

    it("returns a Namespace instance", () => {
      const root = namespace.define();

      expectTypeOf(root.claim("a")).toEqualTypeOf<Namespace>();
    });

    it("throws when the same member is claimed twice", () => {
      const root = namespace.define();
      root.claim("a");

      let error: unknown;
      try {
        root.claim("a");
      } catch (error_) {
        error = error_;
      }

      expect(error).toMatchInlineSnapshot(
        `[Error: Namespace member "a" is already claimed in ""]`,
      );
      expect((error as Error).cause).toEqual({ prefix: "", member: "a" });
    });

    it("allows different members on the same namespace", () => {
      const root = namespace.define();

      expect(root.claim("a").toString()).toBe("a");
      expect(root.claim("b").toString()).toBe("b");
    });

    it("allows the same member on different namespace instances", () => {
      const rootA = namespace.define();
      const rootB = namespace.define();

      expect(rootA.claim("a").toString()).toBe("a");
      expect(rootB.claim("a").toString()).toBe("a");
    });

    it("tracks claims independently per namespace level", () => {
      const root = namespace.define();
      const a = root.claim("a");

      expect(a.claim("b").toString()).toBe("a.b");
      expect(() => a.claim("b")).toThrow(
        `Namespace member "b" is already claimed in "a"`,
      );
    });
  });
});
