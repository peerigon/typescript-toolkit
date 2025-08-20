import { describe, it, expect } from "vitest";
import type { StructuredError, ErrorCategory } from "./errors.js";

describe("StructuredError", () => {
  it("should be JSON serializable", () => {
    const error: StructuredError = {
      code: "INVALID_EMAIL",
      message: "Email address is not valid",
      category: "VALIDATION",
      context: {
        field: "email",
        value: "invalid@",
        nested: {
          array: [1, 2, 3],
          bool: true,
          nullValue: null,
        },
      },
      statusCode: 400,
    };

    const serialized = JSON.stringify(error);
    const deserialized = JSON.parse(serialized);

    expect(deserialized).toEqual(error);
  });

  it("should only allow valid error categories", () => {
    const validCategories: ErrorCategory[] = [
      "VALIDATION",
      "AUTHENTICATION",
      "RESOURCE",
      "EXTERNAL_SERVICE",
      "BUSINESS_LOGIC",
      "SYSTEM",
      "RATE_LIMIT",
      "DATA_INTEGRITY",
    ];

    validCategories.forEach((category) => {
      const error: StructuredError = {
        code: "TEST_ERROR",
        message: "Test message",
        category,
        context: {},
        statusCode: 400,
      };

      expect(error.category).toBe(category);
    });
  });

  it("should handle empty context", () => {
    const error: StructuredError = {
      code: "SIMPLE_ERROR",
      message: "A simple error",
      category: "SYSTEM",
      context: {},
      statusCode: 500,
    };

    const serialized = JSON.stringify(error);
    const deserialized = JSON.parse(serialized);

    expect(deserialized).toEqual(error);
  });

  it("should handle complex nested context", () => {
    const error: StructuredError = {
      code: "COMPLEX_ERROR",
      message: "A complex error",
      category: "BUSINESS_LOGIC",
      context: {
        user: {
          id: 123,
          name: "John Doe",
          roles: ["admin", "user"],
        },
        metadata: {
          timestamp: "2024-01-01T00:00:00.000Z",
          requestId: "abc-123",
          retryCount: 3,
          flags: {
            isRetryable: true,
            isUserError: false,
          },
        },
        values: [1, 2, null, "test", true, false],
      },
      statusCode: 422,
    };

    const serialized = JSON.stringify(error);
    const deserialized = JSON.parse(serialized);

    expect(deserialized).toEqual(error);
  });

  // Type-level tests (these won't run but ensure TypeScript compilation)
  it("should enforce JSON-serializable types in context", () => {
    // This should compile
    const validError: StructuredError = {
      code: "VALID",
      message: "Valid error",
      category: "VALIDATION",
      context: {
        string: "value",
        number: 42,
        boolean: true,
        null: null,
        array: [1, 2, "three"],
        object: { nested: "value" },
      },
      statusCode: 400,
    };

    expect(validError).toBeDefined();

    // The following would not compile if uncommented:
    // const invalidError: StructuredError = {
    //   code: 'INVALID',
    //   message: 'Invalid error',
    //   category: 'VALIDATION',
    //   context: {
    //     function: () => {}, // Error: functions are not JSON-serializable
    //     undefined: undefined, // Error: undefined is not JSON-serializable
    //     symbol: Symbol('test'), // Error: symbols are not JSON-serializable
    //     date: new Date(), // Error: Date objects are not in JsonValue type
    //   },
    //   statusCode: 400
    // };
  });
});
