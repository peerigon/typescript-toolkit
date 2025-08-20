class ErrorDomain {
  constructor(config: { id: string }) {
    this.#config = config;
  }

  #config;

  get id() {
    return this.#config.id;
  }

  category(category: string) {
    return {
      id: this.#config.id,
      category,
    } as const;
  }
}
export type { ErrorDomain };

class ErrorCategory {
  constructor(config: { id: string; domain: ErrorDomain }) {
    this.#config = config;
  }

  #config;

  get id() {
    return [this.#config.domain.id, this.#config.id].join("/");
  }

  get domain() {
    return this.#config.domain;
  }
}
export type { ErrorCategory };

const domain = (id: string) => new ErrorDomain({ id });

export const errors = {
  domain,
} as const;

// export const ErrorCategory = {
//   /**
//    * Input validation, schema violations, format errors, data constraints.
//    * Examples: required fields missing, invalid email format, type mismatches
//    */
//   Validation: "Validation",

//   /**
//    * Identity verification and access control failures.
//    * Examples: invalid credentials, expired tokens, insufficient permissions, account locked
//    */
//   Authentication: "Authentication",

//   /**
//    * Authorization failures.
//    * Examples: insufficient permissions, account locked
//    */
//   Authorization: "Authorization",

//   /**
//    * Entity existence and availability issues.
//    * Examples: not found, already exists, resource unavailable, dependency missing
//    */
//   Resource: "Resource",

//   /**
//    * Third-party integrations and network communication failures.
//    * Examples: API timeouts, service unavailable, payment gateway errors, DNS failures
//    */
//   ExternalService: "ExternalService",

//   /**
//    * Domain-specific rules and workflow violations.
//    * Examples: insufficient funds, booking conflicts, state transition errors, quota exceeded
//    */
//   ConstraintViolation: "ConstraintViolation",

//   /**
//    * Usage restrictions and throttling.
//    * Examples: too many requests, API quota exceeded, concurrent operation limits
//    */
//   RateLimit: "RateLimit",

//   /**
//    * Infrastructure, configuration, and internal failures.
//    * Examples: database connection issues, memory errors, missing config, service crashes
//    */
//   System: "System",

//   /**
//    * Error that is not covered by any other category.
//    */
//   Other: "Other",
// } as const;
// export type ErrorCategory = Enums<typeof ErrorCategory>;

// /**
//  * A structured error interface that provides consistent error representation
//  * across the application. All properties are JSON-serializable, ensuring the
//  * error can be safely transmitted over network protocols or stored.
//  *
//  * @example
//  * ```typescript
//  * const error: StructuredError = {
//  *   code: 'INVALID_EMAIL',
//  *   message: 'Email address is not valid',
//  *   category: 'VALIDATION',
//  *   context: { field: 'email', value: 'invalid@' },
//  *   statusCode: 400
//  * };
//  *
//  * // Safe to serialize and deserialize
//  * const serialized = JSON.stringify(error);
//  * const deserialized = JSON.parse(serialized);
//  * ```
//  */
// // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
// export interface StructuredError {
//   /**
//    * A unique, uppercase, underscore-separated error code that identifies
//    * the specific error condition. Should be stable across versions.
//    * @example 'INVALID_EMAIL', 'USER_NOT_FOUND', 'PAYMENT_FAILED'
//    */
//   code: string;

//   /**
//    * A human-readable error message that describes what went wrong.
//    * Should be suitable for display to end users or developers.
//    */
//   message: string;

//   /**
//    * The error category for high-level classification and handling strategies.
//    */
//   category: ErrorCategory;

//   /**
//    * Additional context information relevant to the error. All values must be
//    * JSON-serializable. Use this for debugging information like field names,
//    * attempted values, limits, etc.
//    */
//   context: Record<string, JsonValue>;

//   /**
//    * HTTP status code associated with this error. Should align with standard
//    * HTTP semantics (e.g., 400 for client errors, 500 for server errors).
//    */
//   statusCode: number;
// }
