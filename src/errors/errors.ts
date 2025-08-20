import type { JsonValue } from "../lib/json.js";

/**
 * Error categories for structured error classification.
 *
 * - **VALIDATION**: Input validation, schema violations, format errors, data constraints.
 *   Examples: required fields missing, invalid email format, type mismatches
 *
 * - **AUTHENTICATION**: Identity verification and access control failures.
 *   Examples: invalid credentials, expired tokens, insufficient permissions, account locked
 *
 * - **RESOURCE**: Entity existence and availability issues.
 *   Examples: not found, already exists, resource unavailable, dependency missing
 *
 * - **EXTERNAL_SERVICE**: Third-party integrations and network communication failures.
 *   Examples: API timeouts, service unavailable, payment gateway errors, DNS failures
 *
 * - **BUSINESS_LOGIC**: Domain-specific rules and workflow violations.
 *   Examples: insufficient funds, booking conflicts, state transition errors, quota exceeded
 *
 * - **SYSTEM**: Infrastructure, configuration, and internal failures.
 *   Examples: database connection issues, memory errors, missing config, service crashes
 *
 * - **RATE_LIMIT**: Usage restrictions and throttling.
 *   Examples: too many requests, API quota exceeded, concurrent operation limits
 *
 * - **DATA_INTEGRITY**: Consistency and constraint violations at the data level.
 *   Examples: foreign key violations, duplicate entries, corrupted data, version conflicts
 */
export type ErrorCategory =
  | "VALIDATION"
  | "AUTHENTICATION"
  | "RESOURCE"
  | "EXTERNAL_SERVICE"
  | "BUSINESS_LOGIC"
  | "SYSTEM"
  | "RATE_LIMIT"
  | "DATA_INTEGRITY";

/**
 * A structured error interface that provides consistent error representation
 * across the application. All properties are JSON-serializable, ensuring the
 * error can be safely transmitted over network protocols or stored.
 *
 * @example
 * ```typescript
 * const error: StructuredError = {
 *   code: 'INVALID_EMAIL',
 *   message: 'Email address is not valid',
 *   category: 'VALIDATION',
 *   context: { field: 'email', value: 'invalid@' },
 *   statusCode: 400
 * };
 *
 * // Safe to serialize and deserialize
 * const serialized = JSON.stringify(error);
 * const deserialized = JSON.parse(serialized);
 * ```
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface StructuredError {
  /**
   * A unique, uppercase, underscore-separated error code that identifies
   * the specific error condition. Should be stable across versions.
   * @example 'INVALID_EMAIL', 'USER_NOT_FOUND', 'PAYMENT_FAILED'
   */
  code: string;

  /**
   * A human-readable error message that describes what went wrong.
   * Should be suitable for display to end users or developers.
   */
  message: string;

  /**
   * The error category for high-level classification and handling strategies.
   */
  category: ErrorCategory;

  /**
   * Additional context information relevant to the error. All values must be
   * JSON-serializable. Use this for debugging information like field names,
   * attempted values, limits, etc.
   */
  context: Record<string, JsonValue>;

  /**
   * HTTP status code associated with this error. Should align with standard
   * HTTP semantics (e.g., 400 for client errors, 500 for server errors).
   */
  statusCode: number;
}
