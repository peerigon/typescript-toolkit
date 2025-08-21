import { packageName } from "../lib/package.ts";

// Using Symbol.for so that multiple instances of the library are compatible
export const resultBrand = Symbol.for(`${packageName}/result/Result`);
