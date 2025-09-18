export const createPrototype = <
  EnumerableProperties extends Record<string, unknown>,
  NonEnumerableProperties extends Record<string, unknown>,
>(
  enumerableProperties: EnumerableProperties,
  nonEnumerableProperties: NonEnumerableProperties,
) => {
  return Object.create(
    Object.prototype,
    Object.fromEntries([
      ...Object.entries(enumerableProperties).map(([key, value]) => [
        key,
        { value, enumerable: true },
      ]),
      ...Object.entries(nonEnumerableProperties).map(([key, value]) => [
        key,
        { value, enumerable: false },
      ]),
    ]) as Record<keyof EnumerableProperties, PropertyDescriptor>,
  ) as EnumerableProperties & NonEnumerableProperties;
};
