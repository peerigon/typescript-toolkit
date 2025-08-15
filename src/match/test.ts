// const _A = "a";
// type _A = typeof _A & {
//   readonly _A: true;
// };
// const _B = "B";
// type _B = typeof _B & {
//   readonly _B: true;
// };

// type _AB = _A | _B;

// const _cases: Record<_AB, string> = {
//   [_A]: "A",
//   // [_B]: "B",
// };

// -------------------------------------------------

const SymbolA = Symbol("A");
const _A = "a" as unknown as typeof SymbolA;
type _A = typeof SymbolA;
const SymbolB = Symbol("B");
const _B = "b" as unknown as typeof SymbolB;
type _B = typeof SymbolB;

type _AB = _A | _B;

const _cases: Record<_AB, string> = {
  [SymbolA]: "A",
  [SymbolB]: "B",
};
