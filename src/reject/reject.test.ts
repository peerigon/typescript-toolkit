import { describe, expect, it } from "vitest";
import { reject } from "./reject.ts";

describe("reject()", () => {
  class CustomError extends Error {
    override readonly name = "CustomError";
    constructor() {
      super("Test message");
    }
  }

  it("returns a function that throws a copy of the error", () => {
    const error = new Error("test");
    const fn = reject(error);
    const caughtError = catchError(fn);

    expect(propertiesOf(caughtError)).toMatchObject(propertiesOf(error));
    expect(error).not.toBe(caughtError);
  });

  it("supports passing a function as error constructor", () => {
    const fn = reject(() => new CustomError());
    const caughtError = catchError(fn);
    expect(caughtError).toBeInstanceOf(CustomError);
  });

  it("provides the correct error stack when the error is passed as an object", () => {
    const error = new CustomError();
    const fn = reject(error);
    const { stack } = catchError(fn);

    // Should contain the error.name and error.message
    expect(stack).toContain("CustomError: Test message");
    // Should not contain the function name where the error is created
    expect(stack).not.toContain("at throwError");
    // Should contain the function name where fn() is called
    expect(stack).toContain("at catchError");
  });

  it("provides the correct error stack when the error is passed as a function", () => {
    const bla = () => new CustomError();
    const fn = reject(bla);
    const { stack } = catchError(fn);

    // Should contain the error.name and error.message
    expect(stack).toContain("CustomError: Test message");
    // Should not contain the function name where the error is created
    expect(stack).not.toContain("at throwError");
    // Should contain the function name where fn() is called
    expect(stack).toContain("at catchError");
  });
});

const catchError = (fn: () => void): Error => {
  let caughtError: any;

  try {
    fn();
  } catch (error: any) {
    caughtError = error;
  }

  if (caughtError instanceof Error) {
    return caughtError;
  }

  throw new Error("No error was thrown");
};

const propertiesOf = (object: any) => {
  // Structured clone won't pick up properties on the prototype chain
  // eslint-disable-next-line unicorn/prefer-structured-clone
  return JSON.parse(JSON.stringify(object));
};
