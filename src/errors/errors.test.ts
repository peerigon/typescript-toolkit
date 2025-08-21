import { describe, expect, it } from "vitest";
import { errors, type ContextWithHttpResponse } from "./errors.js";

const testDomain = "@peerigon/fractals-typescript";

describe("errors", () => {
  describe("domain()", () => {
    it("creates an error domain", () => {
      const errorDomain = errors.domain(testDomain);

      expect(errorDomain).toMatchObject({
        id: testDomain,
      });
    });

    describe("class()", () => {
      const errorDomain = errors.domain(testDomain);

      it("creates an error class", () => {
        const NotFoundError = errorDomain.class("NotFound", {
          message: "Resource not found",
        });
        const notFoundError = new NotFoundError();

        expect(notFoundError).toMatchObject({
          code: `${testDomain}/NotFound`,
          name: "NotFound",
          message: "Resource not found",
        });
      });

      it("contains the expected error stack", () => {
        const NotFoundError = errorDomain.class("NotFound", {
          message: "Resource not found",
        });
        const notFoundError = new NotFoundError();

        // Should contain the error.name and error.message
        expect(notFoundError.stack).toContain("NotFound: Resource not found");
      });

      it("allows to enhance the error class with static context (like http status codes)", () => {
        const staticContext: ContextWithHttpResponse = {
          http: {
            status: 404,
          },
        };
        const NotFoundError = errorDomain.class("NotFound", {
          message: "Resource not found",
          context: staticContext,
        });
        const notFoundError = new NotFoundError();

        expect(notFoundError.context).toMatchObject(staticContext);
      });

      it("allows to enhance the error class with a runtime context", () => {
        type NotFoundContext = {
          resource: string;
          id: string;
        };
        const NotFoundError = errorDomain.class<NotFoundContext>("NotFound", {
          message: ({ context: { resource, id } }) =>
            `${resource} (${id}) not found`,
        });
        const context = {
          resource: "User",
          id: "123",
        } satisfies NotFoundContext;
        const notFoundError = new NotFoundError({
          context,
        });

        expect(notFoundError.context).toBe(context);
        expect(notFoundError.message).toBe("User (123) not found");

        try {
          new NotFoundError();
        } catch {
          expect(true).toBe(true);
        }
      });

      it("implements toJSON()", () => {
        const NotFoundError = errorDomain.class("NotFound", {
          message: "Resource not found",
        });
        const notFoundError = new NotFoundError();
        const json = notFoundError.toJSON();

        expect(json).toMatchObject({
          code: notFoundError.code,
          name: notFoundError.name,
          message: notFoundError.message,
          stack: notFoundError.stack,
        });
      });
    });
  });
});
