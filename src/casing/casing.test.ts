import { describe, it, expect } from "vitest";
import {
  type LatinAlphabetUppercase,
  type LatinAlphabetLowercase,
  type SnakeCase,
  type PascalCase,
  type CamelCase,
  type KebabCase,
  isSnakeCase,
  isPascalCase,
  isCamelCase,
  isKebabCase,
} from "./casing.js";

describe("casing", () => {
  describe("type guards", () => {
    describe("isSnakeCase", () => {
      it("should return true for valid SNAKE_CASE strings", () => {
        expect(isSnakeCase("HELLO_WORLD")).toBe(true);
        expect(isSnakeCase("USER_ID")).toBe(true);
        expect(isSnakeCase("API_KEY_123")).toBe(true);
        expect(isSnakeCase("A")).toBe(true);
        expect(isSnakeCase("_PRIVATE")).toBe(true);
        expect(isSnakeCase("__DOUBLE_UNDERSCORE__")).toBe(true);
      });

      it("should return false for invalid SNAKE_CASE strings", () => {
        expect(isSnakeCase("helloWorld")).toBe(false);
        expect(isSnakeCase("Hello_World")).toBe(false);
        expect(isSnakeCase("hello-world")).toBe(false);
        expect(isSnakeCase("hello world")).toBe(false);
        expect(isSnakeCase("")).toBe(false);
        expect(isSnakeCase("123_NUMBER")).toBe(false);
        expect(isSnakeCase("hello_world")).toBe(false);
      });
    });

    describe("isPascalCase", () => {
      it("should return true for valid PascalCase strings", () => {
        expect(isPascalCase("HelloWorld")).toBe(true);
        expect(isPascalCase("UserProfile")).toBe(true);
        expect(isPascalCase("APIKey")).toBe(true);
        expect(isPascalCase("Component123")).toBe(true);
        expect(isPascalCase("A")).toBe(true);
      });

      it("should return false for invalid PascalCase strings", () => {
        expect(isPascalCase("helloWorld")).toBe(false);
        expect(isPascalCase("Hello_World")).toBe(false);
        expect(isPascalCase("hello-world")).toBe(false);
        expect(isPascalCase("HELLO_WORLD")).toBe(false);
        expect(isPascalCase("hello world")).toBe(false);
        expect(isPascalCase("")).toBe(false);
        expect(isPascalCase("123Component")).toBe(false);
      });
    });

    describe("isCamelCase", () => {
      it("should return true for valid camelCase strings", () => {
        expect(isCamelCase("helloWorld")).toBe(true);
        expect(isCamelCase("userProfile")).toBe(true);
        expect(isCamelCase("apiKey")).toBe(true);
        expect(isCamelCase("component123")).toBe(true);
        expect(isCamelCase("a")).toBe(true);
        expect(isCamelCase("myVar")).toBe(true);
      });

      it("should return false for invalid camelCase strings", () => {
        expect(isCamelCase("HelloWorld")).toBe(false);
        expect(isCamelCase("hello_world")).toBe(false);
        expect(isCamelCase("hello-world")).toBe(false);
        expect(isCamelCase("HELLO_WORLD")).toBe(false);
        expect(isCamelCase("hello world")).toBe(false);
        expect(isCamelCase("")).toBe(false);
        expect(isCamelCase("123component")).toBe(false);
      });
    });

    describe("isKebabCase", () => {
      it("should return true for valid kebab-case strings", () => {
        expect(isKebabCase("hello-world")).toBe(true);
        expect(isKebabCase("user-profile")).toBe(true);
        expect(isKebabCase("api-key")).toBe(true);
        expect(isKebabCase("component-123")).toBe(true);
        expect(isKebabCase("a")).toBe(true);
        expect(isKebabCase("my-var")).toBe(true);
        expect(isKebabCase("multiple-word-example")).toBe(true);
      });

      it("should return false for invalid kebab-case strings", () => {
        expect(isKebabCase("HelloWorld")).toBe(false);
        expect(isKebabCase("hello_world")).toBe(false);
        expect(isKebabCase("helloWorld")).toBe(false);
        expect(isKebabCase("HELLO-WORLD")).toBe(false);
        expect(isKebabCase("hello world")).toBe(false);
        expect(isKebabCase("")).toBe(false);
        expect(isKebabCase("123-component")).toBe(false);
        expect(isKebabCase("Hello-World")).toBe(false);
      });
    });
  });

  describe("type system", () => {
    it("should correctly type LatinAlphabetUppercase", () => {
      const upper: LatinAlphabetUppercase = "A";
      const allUppers: LatinAlphabetUppercase[] = [
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L",
        "M",
        "N",
        "O",
        "P",
        "Q",
        "R",
        "S",
        "T",
        "U",
        "V",
        "W",
        "X",
        "Y",
        "Z",
      ];
      expect(allUppers).toHaveLength(26);
    });

    it("should correctly type LatinAlphabetLowercase", () => {
      const lower: LatinAlphabetLowercase = "a";
      const allLowers: LatinAlphabetLowercase[] = [
        "a",
        "b",
        "c",
        "d",
        "e",
        "f",
        "g",
        "h",
        "i",
        "j",
        "k",
        "l",
        "m",
        "n",
        "o",
        "p",
        "q",
        "r",
        "s",
        "t",
        "u",
        "v",
        "w",
        "x",
        "y",
        "z",
      ];
      expect(allLowers).toHaveLength(26);
    });

    it("should work with type narrowing", () => {
      const testString = "HELLO_WORLD";
      if (isSnakeCase(testString)) {
        const snakeStr: SnakeCase = testString;
        expect(snakeStr).toBe("HELLO_WORLD");
      }
    });

    it("should correctly narrow types with guards", () => {
      const values = ["SNAKE_CASE", "PascalCase", "camelCase", "kebab-case"];

      const snakeCases = values.filter(isSnakeCase);
      const pascalCases = values.filter(isPascalCase);
      const camelCases = values.filter(isCamelCase);
      const kebabCases = values.filter(isKebabCase);

      expect(snakeCases).toEqual(["SNAKE_CASE"]);
      expect(pascalCases).toEqual(["PascalCase"]);
      expect(camelCases).toEqual(["camelCase"]);
      expect(kebabCases).toEqual(["kebab-case"]);
    });
  });
});
