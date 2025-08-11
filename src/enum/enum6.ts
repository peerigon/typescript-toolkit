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

const Enum = {
  define: defineEnum,
};

// -----------------------------------------------------------

const ColorBrand = Symbol("Color");
const Color = Enum.define.branded(ColorBrand, {
  /** Red */
  RED: true,
  /** Green */
  GREEN: true,
  /** Blue */
  BLUE: true,
});
type Color = Enum<typeof Color>;

const StatusBrand = Symbol("Status");
const Status = Enum.define({
  RED: true,
  GREEN: true,
  YELLOW: true,
});
type Status = Enum<typeof Status>;

// const Red = Symbol("Red");
// const Green = Symbol("Green");
// const Blue = Symbol("Blue");
// const Color = Enum.define({
//   RED: Red,
//   GREEN: Green,
//   BLUE: Blue,
// });
// type Color = Enum<typeof Color>;

// const RedStatus = Symbol("Red");
// const GreenStatus = Symbol("Green");
// const YellowStatus = Symbol("Yellow");
// const Status = Enum.define({
//   RED: RedStatus,
//   GREEN: GreenStatus,
//   YELLOW: YellowStatus,
// });
// type Status = Enum<typeof Status>;

const processColor = (_color: Color) => {};

processColor(Color.RED);
processColor(Color.GREEN);
processColor(Color.BLUE);
processColor(Status.RED);
processColor(Status.YELLOW);
processColor("red");
