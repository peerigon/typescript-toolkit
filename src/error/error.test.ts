import { afterEach, describe, expect, it } from "vitest";
import { isDev } from "../lib/is-dev.ts";
import { errors, UnknownError } from "./error.ts";

describe("errors", () => {
  describe("domain()", () => {
    it("namespaces error codes under the domain name", () => {
      const domain = errors.domain(`domain-${Math.random()}`);
      const { SomethingWentWrong } = domain.define({
        SomethingWentWrong: { message: "Something went wrong" },
      });
      const error = new SomethingWentWrong({});

      expect(error.code).toBe(`${domain.code}.SomethingWentWrong`);
    });

    it("throws when the same domain name is used twice", () => {
      const name = `duplicate-domain-${Math.random()}`;
      errors.domain(name);

      expect(() => errors.domain(name)).toThrow();
    });

    it("throws when the same code is defined twice within a domain", () => {
      const domain = errors.domain(`domain-${Math.random()}`);
      domain.define({ NotFound: { message: "Not found" } });

      expect(() =>
        domain.define({ NotFound: { message: "Not found" } }),
      ).toThrow();
    });

    it("namespaces sub-domains further and supports nesting", () => {
      const domain = errors.domain(`domain-${Math.random()}`);
      const subdomain = domain.domain("sub");
      const { SomethingWentWrong } = subdomain.define({
        SomethingWentWrong: { message: "Something went wrong" },
      });
      const error = new SomethingWentWrong({});

      expect(subdomain.code).toBe(`${domain.code}.sub`);
      expect(error.code).toBe(`${domain.code}.sub.SomethingWentWrong`);
    });

    it("supports a custom separator, inherited by sub-domains and errors", () => {
      const domain = errors.domain(`domain-${Math.random()}`, {
        separator: "/",
      });
      const subdomain = domain.domain("sub");
      const { SomeError } = subdomain.define({
        SomeError: { message: "x" },
      });
      const error = new SomeError({});

      expect(subdomain.code).toBe(`${domain.code}/sub`);
      expect(error.code).toBe(`${domain.code}/sub/SomeError`);
    });

    it("gives instanceof for the domain and all ancestor domains", () => {
      const rootDomain = errors.domain(`domain-${Math.random()}`);
      const subdomain = rootDomain.domain("sub");
      const { SomethingWentWrong } = subdomain.define({
        SomethingWentWrong: { message: "Something went wrong" },
      });
      const error = new SomethingWentWrong({});

      expect(error).toBeInstanceOf(SomethingWentWrong);
      expect(error).toBeInstanceOf(subdomain);
      expect(error).toBeInstanceOf(rootDomain);
      expect(error).toBeInstanceOf(Error);
    });

    it("doesn't give instanceof for an unrelated domain", () => {
      const domain = errors.domain(`domain-${Math.random()}`);
      const otherDomain = errors.domain(`domain-${Math.random()}`);
      const { SomeError } = domain.define({ SomeError: { message: "x" } });
      const error = new SomeError({});

      expect(error).not.toBeInstanceOf(otherDomain);
    });

    it("names domain classes with the given name verbatim", () => {
      // Note: domain codes are namespace segments, so they must not contain
      // the "." separator — hence stripping the "0." prefix from the random
      // suffix used to keep this test isolated from others.
      const name = `Http${Math.random().toString(36).slice(2)}`;
      const domain = errors.domain(name);
      const subdomain = domain.domain("Client");

      expect(domain.name).toBe(name);
      expect(subdomain.name).toBe("Client");
    });

    it("is abstract and cannot be instantiated directly", () => {
      const Domain = errors.domain(`domain-${Math.random()}`);
      const Subdomain = Domain.domain("sub");

      expect(() => new Domain()).toThrow();
      expect(() => new Subdomain()).toThrow();
    });
  });

  describe("define()", () => {
    it("defines multiple error classes in a single call", () => {
      const domain = errors.domain(`domain-${Math.random()}`);
      const { NotFound, Unauthorized } = domain.define({
        NotFound: {
          context: { httpStatus: 404 },
          message: (context: { httpStatus: number; resource: string }) =>
            `${context.resource} not found`,
        },
        Unauthorized: {
          context: { httpStatus: 401 },
          message: "Unauthorized",
        },
      });
      const notFound = new NotFound({ resource: "user" });
      const unauthorized = new Unauthorized({});

      expect(notFound.code).toBe(`${domain.code}.NotFound`);
      expect(notFound.message).toBe("user not found");
      expect(notFound.context).toEqual({ httpStatus: 404, resource: "user" });

      expect(unauthorized.code).toBe(`${domain.code}.Unauthorized`);
      expect(unauthorized.message).toBe("Unauthorized");
    });

    it("uses a static message", () => {
      const domain = errors.domain(`domain-${Math.random()}`);
      const { StaticMessage } = domain.define({
        StaticMessage: { message: "This is a static message" },
      });
      const error = new StaticMessage({});

      expect(error.message).toBe("This is a static message");
    });

    it("derives the message from the merged context", () => {
      const domain = errors.domain(`domain-${Math.random()}`);
      const { NotFound } = domain.define({
        NotFound: {
          context: { httpStatus: 404 },
          message: (context: { httpStatus: number; resource: string }) =>
            `${context.resource} not found (${context.httpStatus})`,
        },
      });
      const error = new NotFound({ resource: "user" });

      expect(error.message).toBe("user not found (404)");
    });

    it("merges domain defaults, define-time defaults and runtime context, with runtime winning", () => {
      const domain = errors.domain(`domain-${Math.random()}`, {
        context: { service: "billing-api", httpStatus: 500 },
      });
      const { SomeError } = domain.define({
        SomeError: {
          context: { httpStatus: 404 },
          message: "irrelevant",
        },
      });
      const error = new SomeError({ httpStatus: 400, resource: "user" });

      expect(error.context).toEqual({
        service: "billing-api",
        httpStatus: 400,
        resource: "user",
      });
    });

    it("uses the given code verbatim as the name", () => {
      const domain = errors.domain(`domain-${Math.random()}`);
      // Casing/suffixes are entirely up to the caller — the library doesn't transform it.
      const { NotFound, timeout: Timeout } = domain.define({
        NotFound: { message: "x" },
        timeout: { message: "x" },
      });

      expect(new NotFound({}).name).toBe("NotFound");
      expect(new Timeout({}).name).toBe("timeout");
    });

    it("has a real Error stack", () => {
      const domain = errors.domain(`domain-${Math.random()}`);
      const { SomeError } = domain.define({ SomeError: { message: "x" } });
      const error = new SomeError({});

      expect(error.stack).toBeTypeOf("string");
      expect(error.stack).toContain("SomeError");
    });
  });

  describe("toJSON() / parse()", () => {
    it("serializes to a plain object with code, name, message, context and stack", () => {
      const domain = errors.domain(`domain-${Math.random()}`);
      const { NotFound } = domain.define({
        NotFound: {
          context: { httpStatus: 404 },
          message: (context: { httpStatus: number }) =>
            `Not found (${context.httpStatus})`,
        },
      });
      const error = new NotFound({});
      const json = error.toJSON();

      expect(json).toEqual({
        code: error.code,
        name: "NotFound",
        message: "Not found (404)",
        context: { httpStatus: 404 },
        stack: error.stack,
      });
    });

    it("round-trips a registered error class through JSON", () => {
      const domain = errors.domain(`domain-${Math.random()}`);
      const { NotFound } = domain.define({
        NotFound: {
          context: { httpStatus: 404 },
          message: (context: { httpStatus: number }) =>
            `Not found (${context.httpStatus})`,
        },
      });
      const error = new NotFound({});
      // JSON.stringify implicitly calls error.toJSON().
      const json = JSON.stringify(error);
      const restored = errors.parse(json);

      expect(restored).toBeInstanceOf(NotFound);
      expect(restored.code).toBe(error.code);
      expect(restored.name).toBe(error.name);
      expect(restored.message).toBe(error.message);
      expect(restored.context).toEqual(error.context);
      expect(restored.stack).toBe(error.stack);
    });

    it("accepts an already-parsed object as well as a JSON string", () => {
      const domain = errors.domain(`domain-${Math.random()}`);
      const { NotFound } = domain.define({
        NotFound: { message: "Not found" },
      });
      const error = new NotFound({});

      const restored = errors.parse(error.toJSON());

      expect(restored).toBeInstanceOf(NotFound);
      expect(restored.code).toBe(error.code);
    });

    it("falls back to UnknownError for an unregistered code", () => {
      const restored = errors.parse({
        code: "some.unregistered.code",
        name: "SomeError",
        message: "Something happened",
        context: { foo: "bar" },
        stack: "SomeError: Something happened",
      });

      expect(restored).toBeInstanceOf(UnknownError);
      expect(restored.code).toBe("some.unregistered.code");
      expect(restored.message).toBe("Something happened");
      expect(restored.context).toEqual({ foo: "bar" });
    });
  });

  describe("toJSON() stack serialization", () => {
    it("defaults to isDev", () => {
      const domain = errors.domain(`domain-${Math.random()}`);
      const { SomeError } = domain.define({ SomeError: { message: "x" } });
      const error = new SomeError({});

      expect(error.toJSON().stack).toBe(isDev ? error.stack : undefined);
    });

    it("can be forced on explicitly", () => {
      const domain = errors.domain(`domain-${Math.random()}`);
      const { SomeError } = domain.define({ SomeError: { message: "x" } });
      const error = new SomeError({});

      expect(error.toJSON({ includeStack: true }).stack).toBeTypeOf("string");
    });

    it("can be forced off explicitly", () => {
      const domain = errors.domain(`domain-${Math.random()}`);
      const { SomeError } = domain.define({ SomeError: { message: "x" } });
      const error = new SomeError({});

      expect(error.toJSON({ includeStack: false }).stack).toBeUndefined();
    });

    it("also applies to UnknownError", () => {
      const restored = errors.parse({
        code: "some.unregistered.code",
        name: "SomeError",
        message: "Something happened",
        context: {},
        stack: "SomeError: Something happened",
      });

      expect(restored.toJSON({ includeStack: true }).stack).toBeTypeOf(
        "string",
      );
      expect(restored.toJSON({ includeStack: false }).stack).toBeUndefined();
    });
  });

  describe("serialize.includeStack", () => {
    afterEach(() => {
      errors.serialize.includeStack = isDev;
    });

    it("defaults to isDev", () => {
      expect(errors.serialize.includeStack).toBe(isDev);
    });

    it("controls the default for toJSON() when flipped globally", () => {
      errors.serialize.includeStack = false;

      const domain = errors.domain(`domain-${Math.random()}`);
      const { SomeError } = domain.define({ SomeError: { message: "x" } });
      const error = new SomeError({});

      expect(error.toJSON().stack).toBeUndefined();
    });

    it("can still be overridden per-call", () => {
      errors.serialize.includeStack = false;

      const domain = errors.domain(`domain-${Math.random()}`);
      const { SomeError } = domain.define({ SomeError: { message: "x" } });
      const error = new SomeError({});

      expect(error.toJSON({ includeStack: true }).stack).toBeTypeOf("string");
    });
  });
});
