declare const enumBrand: unique symbol;

export type EnumBrand<Brand> = {
  readonly [enumBrand]: Brand;
};

export const defineEnum = <
  const Brand extends symbol,
  const Definition extends Record<string, string | number | boolean>,
>(
  brand: Brand,
  definition: Definition,
) => {
  type BrandedEnum = {
    [Key in keyof Definition]: Definition[Key] & {
      readonly [enumBrand]: Brand;
    };
  };

  return Object.fromEntries(
    Object.entries(definition).map(([key, value]) => [key, value]),
  ) as BrandedEnum;
};

export type Enum<T> = T[keyof T];
