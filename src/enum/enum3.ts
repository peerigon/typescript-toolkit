type EnumOrdinal = string | number | symbol;

class EnumValue {
  #name: string;
  readonly #ordinal;

  get ordinal() {
    return this.#ordinal;
  }

  constructor(name: string) {
    const ordinal = Symbol(name);

    this.#name = name;
    this.#ordinal = name as string & {
      [ordinal]: typeof ordinal;
    };
    Object.freeze(this);
  }

  toString() {
    return this.#name;
  }

  valueOf() {
    return this.#ordinal;
  }
}

export const defineEnum = <
  const Definition extends Record<string, EnumOrdinal | true>,
>(
  definition: Definition,
) => {
  const enumValues = Object.fromEntries(
    Object.entries(definition).map(([key, value]) => [key, Symbol(key)]),
  ) as {
    [Key in keyof Definition]: ReturnType<typeof Symbol>;
  };

  Object.freeze(enumValues);

  return enumValues;
};
export type Enum<GivenEnum> = GivenEnum[keyof GivenEnum];

const Color = defineEnum({
  /**
   * This is color red
   */
  RED: true,
  /**
   * This is color green
   */
  GREEN: true,
  /**
   * This is color blue
   */
  BLUE: "blue",
});
type Color = Enum<typeof Color>;

const Status = defineEnum({
  PENDING: true,
  APPROVED: "approved",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
});
type Status = Enum<typeof Status>;

const processColor = (color: Color) => {
  console.log(color);
};

let blub: typeof Color.RED = Color.RED;

blub = Color.GREEN;

processColor(Color.RED);
processColor(Color.GREEN);
processColor(Color.BLUE);
processColor(Status.PENDING);
