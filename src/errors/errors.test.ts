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

    describe("class().define()", () => {
      type NotFoundContext = {
        resource: string;
        id: string;
      };
      const errorDomain = errors.domain(testDomain);
      const message = "Resource not found";

      it("creates an error class", () => {
        const NotFoundError = errorDomain.class("NotFound").define({
          message,
        });
        const notFoundError = new NotFoundError();

        expect(notFoundError).toMatchObject({
          code: `${testDomain}/NotFound`,
          name: "NotFound",
          message,
        });
      });

      it("contains the expected error stack", () => {
        const NotFoundError = errorDomain.class("NotFound").define({
          message,
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
        const NotFoundError = errorDomain
          .class("NotFound", staticContext)
          .define({
            message,
          });
        const notFoundError = new NotFoundError();

        expect(notFoundError.context).toMatchObject(staticContext);
      });

      it("allows to enhance the error class with a runtime context", () => {
        const NotFoundError = errorDomain
          .class("NotFound")
          .define<NotFoundContext>({
            message: ({ resource, id }) => `${resource} (${id}) not found`,
          });
        const context: NotFoundContext = {
          resource: "User",
          id: "123",
        };
        const notFoundError = new NotFoundError({
          context,
        });

        expect(notFoundError.context).toEqual(context);
        expect(notFoundError.message).toBe("User (123) not found");
      });

      it("shows a type error if a runtime context is required but not provided", () => {
        const NotFoundError = errorDomain
          .class("NotFound")
          .define<NotFoundContext>({
            message: ({ resource, id }: NotFoundContext) =>
              `${resource} (${id}) not found`,
          });

        expect(() => {
          // @ts-expect-error RuntimeContext is required but not provided
          new NotFoundError();
        }).not.toThrow();
      });

      it("allows to combine static and runtime context", () => {
        const staticContext: ContextWithHttpResponse = {
          http: {
            status: 404,
          },
        };
        const NotFoundError = errorDomain
          .class("NotFound", staticContext)
          .define<NotFoundContext>({
            message: ({ resource, id }) => `${resource} (${id}) not found`,
          });
        const runtimeContext: NotFoundContext = {
          resource: "User",
          id: "123",
        };
        const notFoundError = new NotFoundError({
          context: runtimeContext,
        });

        expect(notFoundError.context).toMatchObject({
          ...staticContext,
          ...runtimeContext,
        });
      });

      it("implements toJSON()", () => {
        const NotFoundError = errorDomain.class("NotFound").define({
          message,
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

      it("toJSON() excludes context and masks stack for security", () => {
        const NotFoundError = errorDomain.class("NotFound").define({
          message,
        });
        const notFoundError = new NotFoundError();
        const json = notFoundError.toJSON();

        expect(json.context).toBeUndefined();
        expect(json.stack).toBe("Not available");
      });

      it("error instances are instanceof Error", () => {
        const NotFoundError = errorDomain.class("NotFound").define({
          message,
        });
        const notFoundError = new NotFoundError();

        expect(notFoundError).toBeInstanceOf(Error);
        expect(notFoundError).toBeInstanceOf(NotFoundError);
      });

      it("supports error cause in ErrorOptions", () => {
        const NotFoundError = errorDomain.class("NotFound").define({
          message,
        });
        const cause = new Error("Network error");
        const notFoundError = new NotFoundError({ cause });

        expect(notFoundError.cause).toBe(cause);
      });

      it("passes cause to message function", () => {
        const NotFoundError = errorDomain
          .class("NotFound")
          .define<NotFoundContext>({
            message: ({ resource, id }, cause) =>
              `${resource} (${id}) not found${
                cause ? ` - caused by: ${cause}` : ""
              }`,
          });
        const cause = new Error("Network error");
        const notFoundError = new NotFoundError({
          context: {
            resource: "User",
            id: "123",
          },
          cause,
        });

        expect(notFoundError.message).toBe(
          "User (123) not found - caused by: Error: Network error",
        );
      });

      it("handles undefined runtime context gracefully", () => {
        const NotFoundError = errorDomain
          .class("NotFound")
          .define<NotFoundContext>({
            message,
          });
        const notFoundError = new NotFoundError({
          context: undefined,
        });

        expect(notFoundError.context).toEqual({});
      });

      it("preserves error name in stack trace", () => {
        const CustomError = errorDomain.class("CustomError").define({
          message: "Something went wrong",
        });
        const customError = new CustomError();

        expect(customError.stack).toContain("CustomError");
      });

      it("error code follows the domain/name pattern", () => {
        const NotFound = errorDomain.class("NotFound").define({
          message,
        });
        const validationError = new NotFound();

        expect(validationError.code).toBe(`${testDomain}/NotFound`);
      });

      it("static context is immutable on instances", () => {
        const staticContext = {
          http: {
            status: 400,
          },
        };
        const ValidationError = errorDomain
          .class("ValidationError", staticContext)
          .define({
            message: "Validation failed",
          });
        const validationError = new ValidationError();

        expect(validationError.context).not.toBe(staticContext);
        expect(validationError.context).toEqual(staticContext);
      });
    });
  });
});
