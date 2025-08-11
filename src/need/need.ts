export const need = <Value>(
  value: Value,
  message = `Expected value to be defined, but got ${value}`,
): NonNullable<Value> => {
  if (value === undefined || value === null) {
    throw new TypeError(message);
  }
  return value;
};
