export type SignalGetter<Value> = {
  (): Value;
  watch: (watcher: SignalWatcher<Value>) => () => void;
};

export type SignalSetter<Value> = (value: Value) => void;

export type Signal<Value> = Disposable & {
  get: SignalGetter<Value>;
  set: SignalSetter<Value>;
  watch: SignalGetter<Value>["watch"];
};

export const signal = <Value>(initialValue: Value): Signal<Value> => {
  const watchers = new Set<SignalWatcher<Value>>();
  let value = initialValue;

  const watch: SignalGetter<Value>["watch"] = (watcher) => {
    watchers.add(watcher);
    return () => {
      watchers.delete(watcher);
    };
  };

  const get: SignalGetter<Value> = () => value;
  get.watch = watch;

  const set: SignalSetter<Value> = (newValue) => {
    const previousValue = value;
    value = newValue;
    for (const watcher of watchers) {
      watcher({ value, previousValue });
    }
  };

  const dispose = () => {
    watchers.clear();
  };

  return { get, set, watch, [Symbol.dispose]: dispose };
};

signal.from = <Value>(
  getFromSource: () => Value,
  subscribeToSource: (notify: () => void) => () => void,
): Omit<Signal<Value>, "set"> => {
  const derivedSignal = signal(getFromSource());

  let watcherCount = 0;
  let unwatchFromSource: (() => void) | undefined;
  const watch = (watcher: SignalWatcher<Value>) => {
    const unwatch = derivedSignal.watch(watcher);
    if (watcherCount === 0) {
      unwatchFromSource = subscribeToSource(() => {
        derivedSignal.set(getFromSource());
      });
    }
    watcherCount++;
    return () => {
      unwatch();
      watcherCount--;
      if (watcherCount === 0) {
        unwatchFromSource?.();
        unwatchFromSource = undefined;
      }
    };
  };

  const dispose = () => {
    unwatchFromSource?.();
    derivedSignal[Symbol.dispose]();
  };

  return { get: derivedSignal.get, watch, [Symbol.dispose]: dispose };
};

export type SignalWatcher<Value> = ({
  value,
  previousValue,
}: {
  value: Value;
  previousValue: Value;
}) => void;
