/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unnecessary-type-parameters */
/* eslint-disable func-style */
/* eslint-disable prefer-arrow/prefer-arrow-functions */

function createSymbol<const Symbol1 extends symbol>(name: string): Symbol1 {
  return Symbol(name) as Symbol1;
}

type Bla = Record<string, unique symbol>;

const symbol1: unique symbol = createSymbol("symbol1");
