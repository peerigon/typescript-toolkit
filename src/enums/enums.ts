import { stringify } from "../lib/string.ts";

const defineBrandedEnums = <
  const Brand extends symbol,
  const Definition extends Record<string, unknown>,
>(
  brand: Brand,
  definition: Definition,
) => {
  const enumsDefinition = Object.fromEntries(
    Object.entries(definition).map(([key, value]) => [
      key,
      value === true ? key : value,
    ]),
  ) as {
    [Key in keyof Definition]: (Definition[Key] extends true
      ? Key
      : Definition[Key]) & {
      readonly brand: Brand;
    };
  };

  Object.freeze(enumsDefinition);

  return enumsDefinition;
};

const enumsBrand = Symbol("enums");

const defineEnums = <const Definition extends Record<string, unknown>>(
  definition: Definition,
) => {
  return defineBrandedEnums(enumsBrand, definition);
};

defineEnums.branded = defineBrandedEnums;

/**
 * Extract the union type of all enum values from an enum definition.
 *
 * @template Definition - The enum definition object type
 *
 * @example
 * ```ts
 * const Color = enums.define({ Red: true, Green: true, Blue: true });
 * type Color = Enums<typeof Color>; // "Red" | "Green" | "Blue"
 * ```
 */
export type Enums<Definition> = Definition[keyof Definition];

/**
 * Utilities for creating type-safe enums with branded types to prevent mixing different enums.
 */
export const enums = {
  /**
   * Define a type-safe enum from an object definition.
   *
   * When a property value is `true`, the property key becomes the enum value.
   * Otherwise, the provided value is used as the enum value.
   *
   * @param definition - Object defining the enum keys and values
   * @returns A frozen enum object with type-safe values
   *
   * @example
   * ```ts
   * // Using property keys as values
   * const Direction = enums.define({
   *   North: true,
   *   South: true,
   *   East: true,
   *   West: true
   * });
   * console.log(Direction.North); // "North"
   *
   * // Using custom values
   * const Status = enums.define({
   *   Inactive: 0,
   *   Pending: 1,
   *   Active: 2,
   * });
   * ```
   */
  define: defineEnums,

  /**
   * Parse a value to ensure it's a valid enum value.
   *
   * @param definition - The enum object created with enums.define
   * @param value - The value to parse
   * @returns The value typed as the enum type
   * @throws {TypeError} If the value is not a valid enum value
   *
   * @example
   * ```ts
   * const Direction = enums.define({
   *   North: true,
   *   South: true
   * });
   *
   * const dir = enums.parse(Direction, "North"); // Returns Direction.North
   * const invalid = enums.parse(Direction, "West"); // Throws TypeError
   * ```
   */
  parse: <Definition extends Record<string, unknown>>(
    definition: Definition,
    value: unknown,
  ): Enums<Definition> => {
    const enumValues = Object.values(definition);

    if (enumValues.includes(value)) {
      return value as Enums<Definition>;
    }

    throw new TypeError(
      `Invalid enum value ${stringify(value)}. Expected one of: ${enumValues.map((value) => stringify(value)).join(", ")}`,
      {
        cause: { enum: definition, value },
      },
    );
  },

  /**
   * Get an array of [key, value] tuples from an enum definition.
   *
   * @param definition - The enum object created with enums.define
   * @returns Array of [key, value] tuples
   *
   * @example
   * ```ts
   * const Direction = enums.define({
   *   North: true,
   *   South: true,
   *   East: "east-value",
   * });
   *
   * const entries = enums.entries(Direction);
   * // [["North", "North"], ["South", "South"], ["East", "east-value"]]
   * ```
   */
  entries: <Definition extends Record<string, unknown>>(
    definition: Definition,
  ): Array<[keyof Definition, Enums<Definition>]> => {
    return Object.entries(definition) as Array<
      [keyof Definition, Enums<Definition>]
    >;
  },
};
