type EnumOrdinal = string | number | symbol;

const defineEnum = <const Definition extends Record<string, symbol>>(
  definition: Definition,
) => {
  return definition;
};
export type Enum<Definition> = Definition[keyof Definition];

const Red = Symbol("Red");
const Green = Symbol("Green");
const Blue = Symbol("Blue");
const Color = defineEnum({
  RED: Red,
  GREEN: Green,
  BLUE: Blue,
});
type Color = Enum<typeof Color>;

const RedStatus = Symbol("Red");
const GreenStatus = Symbol("Green");
const Status = defineEnum({
  RED: RedStatus,
  GREEN: GreenStatus,
});
type Status = Enum<typeof Status>;

const processColor = (_color: Color) => {};

processColor(Color.RED);
processColor(Color.GREEN);
processColor(Color.BLUE);
processColor(Status.RED);
// -----------------------------------------------------------
