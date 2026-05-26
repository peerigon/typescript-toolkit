export type ReadSignal<Value> = {
  (): Value;
  subscribe: (reader: SignalReader<Value>) => () => void;
};

export type WriteSignal<Value> = (value: Value) => void;

export type Signal<Value> = Disposable & {
  read: ReadSignal<Value>;
  write: WriteSignal<Value>;
  subscribe: ReadSignal<Value>["subscribe"];
};

export const signal = <Value>(initialValue: Value): Signal<Value> => {
  const readers = new Set<SignalReader<Value>>();
  let value = initialValue;

  const subscribe: ReadSignal<Value>["subscribe"] = (reader) => {
    readers.add(reader);
    return () => {
      readers.delete(reader);
    };
  };

  const read: ReadSignal<Value> = () => value;
  read.subscribe = subscribe;

  const write: WriteSignal<Value> = (newValue) => {
    const previousValue = value;
    value = newValue;
    for (const reader of readers) {
      reader({ value, previousValue });
    }
  };

  const dispose = () => {
    readers.clear();
  };

  return { read, write, subscribe, [Symbol.dispose]: dispose };
};

signal.from = <Value>(
  readFromSource: () => Value,
  subscribeToSource: (notify: () => void) => () => void,
): Omit<Signal<Value>, "write"> => {
  const derivedSignal = signal(readFromSource());

  let readerCount = 0;
  let unsubscribeFromSource: (() => void) | undefined;
  const subscribe = (reader: SignalReader<Value>) => {
    const unsubscribe = derivedSignal.subscribe(reader);
    if (readerCount === 0) {
      unsubscribeFromSource = subscribeToSource(() => {
        derivedSignal.write(readFromSource());
      });
    }
    readerCount++;
    return () => {
      unsubscribe();
      readerCount--;
      if (readerCount === 0) {
        unsubscribeFromSource?.();
        unsubscribeFromSource = undefined;
      }
    };
  };

  const dispose = () => {
    unsubscribeFromSource?.();
    derivedSignal[Symbol.dispose]();
  };

  return { read: derivedSignal.read, subscribe, [Symbol.dispose]: dispose };
};

export type SignalReader<Value> = ({
  value,
  previousValue,
}: {
  value: Value;
  previousValue: Value;
}) => void;
