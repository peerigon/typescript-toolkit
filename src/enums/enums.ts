const defineBrandedEnum = <
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  const Brand extends symbol,
  const Definition extends Record<string, EnumsOrdinal | true>,
>(
  brand: Brand,
  definition: Definition,
) => {
  const enumDefinition = Object.fromEntries(
    Object.entries(definition).map(([key, value]) => [
      key,
      value === true ? key : value,
    ]),
  ) as {
    [Key in keyof Definition]: (Definition[Key] extends true
      ? Key
      : Definition[Key]) & {
      readonly [brand]: Brand;
    };
  };

  Object.freeze(enumDefinition);

  return enumDefinition;
};

const enumBrand = Symbol("Enum");

const defineEnum = <
  const Definition extends Record<string, EnumsOrdinal | true>,
>(
  definition: Definition,
) => {
  return defineBrandedEnum(enumBrand, definition);
};

defineEnum.branded = defineBrandedEnum;

type EnumsOrdinal = string | number | symbol;
export type Enums<Definition> = Definition[keyof Definition];

export const enums = {
  define: defineEnum,
};
