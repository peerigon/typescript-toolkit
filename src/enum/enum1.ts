import { match } from "../match/match.ts";
import { need } from "../need/need.ts";

// const MyEnum = {
//   /** A description */
//   A: "a",
//   /** B description */
//   B: "b",
//   /** C description */
//   C: "c",
// } as const;
// type MyEnum = (typeof MyEnum)[keyof typeof MyEnum];

// const _myEnum: MyEnum = MyEnum.A;

// ------------------------------------------------------------
// export type Enum<MyEnum> = MyEnum[keyof MyEnum];

// const defineEnum = <const EnumValue extends string | number | symbol>(
//   values: Record<string, EnumValue>,
// ) => {
//   // eslint-disable-next-line unicorn/no-static-only-class, @typescript-eslint/no-extraneous-class
//   const EnumClass = class {
//     static values = Object.fromEntries(
//       Object.entries(values).map(
//         ([key, _value]) => [key, new EnumClass()] as const,
//       ),
//     ) as { [key in keyof typeof values]: EnumClass };
//   };
//   return EnumClass;
// };

// const MyEnum = defineEnum({
//   /** A description */
//   A: "a",
//   /** B description */
//   B: "b",
//   /** C description */
//   C: "c",
// });
// // type MyEnum = Enum<typeof MyEnum>;

// const _myEnum: MyEnum = MyEnum.values.A;

// ------------------------------------------------------------

class Enum {
  constructor(value?: string) {
    if (arguments.length === 0) return;

    const [, enumValue] = need(
      Object.entries(this.constructor).find(
        ([stringifiedValue]) => stringifiedValue === value,
      ),
    );

    // eslint-disable-next-line no-constructor-return
    return enumValue as this;
  }

  static parse<GivenEnum extends typeof Enum>(
    this: GivenEnum,
  ): InstanceType<GivenEnum> {
    return new this() as InstanceType<GivenEnum>;
  }

  valueOf() {
    const [stringifiedValue] = need(
      Object.entries(this.constructor).find(([, value]) => value === this),
    );

    return stringifiedValue;
  }

  toJSON() {
    return this.valueOf();
  }
}

class Color extends Enum {
  /**
   * The color red
   */
  static RED = new Color();
  /**
   * The color green
   */
  static GREEN = new Color();
  /**
   * The color blue
   */
  static BLUE = new Color();
}

const color: Color = Color.RED;

if (color === Color.RED) {
  console.log("red");
}

console.log(color.toJSON());

const serialized = color.toJSON();

const deserialized = new Color(serialized);

if (deserialized === Color.RED) {
  console.log("It works");
}

match(deserialized, {
  RED: () => console.log("red"),
  GREEN: () => console.log("green"),
  BLUE: () => console.log("blue"),
});

// Demonstrate the static create method
const createdColor: Color = Color.parse();
console.log("Created color:", createdColor);
