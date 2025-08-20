export type LatinAlphabetUppercase =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L"
  | "M"
  | "N"
  | "O"
  | "P"
  | "Q"
  | "R"
  | "S"
  | "T"
  | "U"
  | "V"
  | "W"
  | "X"
  | "Y"
  | "Z";

export type LatinAlphabetLowercase =
  | "a"
  | "b"
  | "c"
  | "d"
  | "e"
  | "f"
  | "g"
  | "h"
  | "i"
  | "j"
  | "k"
  | "l"
  | "m"
  | "n"
  | "o"
  | "p"
  | "q"
  | "r"
  | "s"
  | "t"
  | "u"
  | "v"
  | "w"
  | "x"
  | "y"
  | "z";

export type Digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

export type SnakeCase<T extends string = string> =
  T extends `${infer Start}${infer Rest}`
    ? Start extends
        | LatinAlphabetUppercase
        | LatinAlphabetLowercase
        | Digit
        | "_"
      ? T
      : never
    : T;

export type PascalCase<T extends string = string> =
  T extends `${LatinAlphabetUppercase}${string}`
    ? T extends `${infer Start}${infer Rest}`
      ? Start extends LatinAlphabetUppercase | LatinAlphabetLowercase | Digit
        ? T
        : never
      : T
    : never;

export type CamelCase<T extends string = string> =
  T extends `${LatinAlphabetLowercase}${string}`
    ? T extends `${infer Start}${infer Rest}`
      ? Start extends LatinAlphabetUppercase | LatinAlphabetLowercase | Digit
        ? T
        : never
      : T
    : never;

export type KebabCase<T extends string = string> =
  T extends `${infer Start}${infer Rest}`
    ? Start extends LatinAlphabetLowercase | Digit | "-"
      ? T
      : never
    : T;

const SNAKE_CASE_PATTERN = /^[A-Z_][A-Z0-9_]*$/;
const PASCAL_CASE_PATTERN = /^[A-Z][a-zA-Z0-9]*$/;
const CAMEL_CASE_PATTERN = /^[a-z][a-zA-Z0-9]*$/;
const KEBAB_CASE_PATTERN = /^[a-z][a-z0-9-]*$/;

export function isSnakeCase(value: string): value is SnakeCase {
  return SNAKE_CASE_PATTERN.test(value);
}

export function isPascalCase(value: string): value is PascalCase {
  return PASCAL_CASE_PATTERN.test(value);
}

export function isCamelCase(value: string): value is CamelCase {
  return CAMEL_CASE_PATTERN.test(value);
}

export function isKebabCase(value: string): value is KebabCase {
  return KEBAB_CASE_PATTERN.test(value);
}
