type EnumOrdinal = string | number | symbol;

export const defineEnum = <
  const Brand extends symbol,
  const Definition extends Record<string, EnumOrdinal>,
>(
  definition: Definition,
  brand = Symbol("Brand") as Brand,
): {
  [Key in keyof Definition]: Definition[Key] & {
    readonly [brand]: Brand;
  };
} => {
  return Object.fromEntries(
    Object.entries(definition).map(([key, value]) => [key, value]),
  ) as {
    [Key in keyof Definition]: Definition[Key] & {
      readonly [brand]: Brand;
    };
  };
};
export type Enum<Definition> = Definition[keyof Definition];

const ColorBrand = Symbol("Color");
const Color = defineEnum(
  {
    RED: "red",
    GREEN: "green",
    BLUE: "blue",
  },
  ColorBrand,
);
type Color = Enum<typeof Color>;

const StatusBrand = Symbol("Status");
const Status = defineEnum(
  {
    RED: "red",
    GREEN: "green",
  },
  StatusBrand,
);
type Status = Enum<typeof Status>;

const processColor = (color: Color) => {};

processColor(Color.RED);
processColor(Color.GREEN);
processColor(Color.BLUE);
processColor(Status.RED);
processColor("red");
