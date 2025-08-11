class EnumValue {
  readonly name: string;
  readonly ordinal: number;

  constructor(name: string, ordinal: number) {
    this.name = name;
    this.ordinal = ordinal;
    Object.freeze(this);
  }

  toString(): string {
    return this.name;
  }

  valueOf(): number {
    return this.ordinal;
  }
}

type Enum<T extends Record<string, any>> = {
  new (name: string, ordinal: number): EnumValue;
  values: () => Array<EnumValue>;
  valueOf: (name: string) => EnumValue | undefined;
} & {
  readonly [K in keyof T]: EnumValue;
};

const defineEnum = <const EnumValues extends Record<string, any>>(
  className: string,
  definition: EnumValues,
): Enum<EnumValues> => {
  // Create the enum class dynamically
  const EnumClass = class extends EnumValue {
    constructor(name: string, ordinal: number) {
      super(name, ordinal);
      Object.freeze(this);
    }

    static values(): Array<EnumValue> {
      return Object.keys(this)
        .filter((key) => (this as any)[key] instanceof this)
        .map((key) => (this as any)[key] as EnumValue);
    }
  };

  // Set the class name
  Object.defineProperty(EnumClass, "name", { value: className });

  // Add static members dynamically
  let ordinal = 0;
  for (const key in definition) {
    if (Object.hasOwn(definition, key)) {
      const instance = new EnumClass(key, ordinal++);

      // Add the static property
      Object.defineProperty(EnumClass, key, {
        value: instance,
        writable: false,
        enumerable: true,
        configurable: false,
      });
    }
  }

  // Freeze the class to prevent modifications
  Object.freeze(EnumClass);

  return EnumClass as Enum<EnumValues>;
};

// Create the Color enum class - fully typed!
const Color = defineEnum("Color", {
  /**
   * The color red
   */
  RED: true,
  GREEN: true,
  BLUE: true,
});
type Color = (typeof Color)[keyof typeof Color];

const Status = defineEnum("Status", {
  PENDING: true,
  APPROVED: true,
  REJECTED: true,
  CANCELLED: true,
});
type Status = (typeof Status)[keyof typeof Status];

// TypeScript knows about all the enum members
console.log("Color.RED:", Color.RED);
console.log("Color.RED.name:", Color.RED.name);
console.log("Color.RED.toString():", Color.RED.toString());
console.log("All values:", Color.values());
// console.log("RED === RED:", Color.RED === Color.RED); // This is always true
console.log("RED === GREEN:", Color.RED === Color.GREEN);

const processColor = (color: typeof Color.RED) => {
  console.log(`Processing color: ${color.name}`);
};

processColor(Color.RED); // ✓ Works
processColor(Color.BLUE); // ✓ Works
processColor(Status.PENDING); // ✗ TypeScript error - wrong enum type!
