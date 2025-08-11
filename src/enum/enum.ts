const defineBrandedEnum = <
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  const Brand extends symbol,
  const Definition extends Record<string, EnumOrdinal | true>,
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
  const Definition extends Record<string, EnumOrdinal | true>,
>(
  definition: Definition,
) => {
  return defineBrandedEnum(enumBrand, definition);
};

defineEnum.branded = defineBrandedEnum;

type EnumOrdinal = string | number | symbol;
export type Enum<Definition> = Definition[keyof Definition];

export const Enum = {
  define: defineEnum,
};
