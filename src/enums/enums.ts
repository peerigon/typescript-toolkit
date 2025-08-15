const defineBrandedEnums = <
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  const Brand extends symbol,
  const Definition extends Record<string, EnumsOrdinal | true>,
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
      readonly [brand]: Brand;
    };
  };

  Object.freeze(enumsDefinition);

  return enumsDefinition;
};

const enumsBrand = Symbol("enums");

const defineEnums = <
  const Definition extends Record<string, EnumsOrdinal | true>,
>(
  definition: Definition,
) => {
  return defineBrandedEnums(enumsBrand, definition);
};

defineEnums.branded = defineBrandedEnums;

type EnumsOrdinal = string | number | symbol;
export type Enums<Definition> = Definition[keyof Definition];

export const enums = {
  define: defineEnums,
};
