## `signals`

- 📦 Below 250 Bytes
- ✅ Zero dependencies

Minimal writable state cell with explicit watchers. Calling `set` pushes `{ value, previousValue }` to every registered watcher.

Use `signal.from` to mirror values from an external source (DOM events, timers, other stores) with ref-counted watching — the source is only wired while at least one watcher is watching.

### Basic usage

```ts
import { signal } from "@peerigon/typescript-toolkit/signals";

const count = signal(0);

const unwatch = count.watch(({ value, previousValue }) => {
  console.log(value, previousValue);
});

count.set(1);
count.get(); // 1

unwatch();
```

### Bridging an external source

```ts
const windowWidth = signal.from(
  () => window.innerWidth,
  (notify) => {
    window.addEventListener("resize", notify);
    return () => window.removeEventListener("resize", notify);
  },
);

const unwatch = windowWidth.watch(({ value }) => {
  console.log("width", value);
});
```

`signal.from` returns a read-only signal (no `set`). When the source calls `notify`, the current value is re-fetched and watchers are updated.

### Disposal

Signals are `Disposable`. With the [`using`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/using) declaration, dispose runs automatically when the block ends.

```ts
{
  using windowWidth = signal.from(
    () => window.innerWidth,
    (notify) => {
      window.addEventListener("resize", notify);
      return () => window.removeEventListener("resize", notify);
    },
  );

  windowWidth.watch(({ value }) => {
    console.log("width", value);
  });
} // dispose clears watchers and removes the resize listener
```

### API Reference

#### `signal(initialValue)`

Create a writable signal with the given initial value.

```ts
signal<Value>(initialValue: Value): Signal<Value>
```

| Parameter      | Type    | Description          |
| -------------- | ------- | -------------------- |
| `initialValue` | `Value` | Initial stored value |

**Returns:** `Signal<Value>` — `get`, `set`, `watch`, and `[Symbol.dispose]`

#### `signal.from(getFromSource, subscribeToSource)`

Create a read-only signal backed by an external source.

```ts
signal.from<Value>(
  getFromSource: () => Value,
  subscribeToSource: (notify: () => void) => () => void,
): Omit<Signal<Value>, "set">
```

| Parameter           | Type                                 | Description                                                                                |
| ------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------ |
| `getFromSource`     | `() => Value`                        | Called to get the current value when the source notifies or on first setup                 |
| `subscribeToSource` | `(notify: () => void) => () => void` | Subscribe to the source; call `notify` when the value may have changed; return unsubscribe |

**Returns:** `Omit<Signal<Value>, "set">` — `get`, `watch`, and `[Symbol.dispose]`

**Watch lifecycle:** The source `subscribeToSource` runs when the first watcher watches and its unsubscribe runs when the last watcher unwatches.

#### `signal.get` / `signal.set` / `signal.watch`

| Member  | Type                                            | Description                                  |
| ------- | ----------------------------------------------- | -------------------------------------------- |
| `get`   | `SignalGetter<Value>`                           | `()` returns current value; also has `watch` |
| `set`   | `(value: Value) => void`                        | Sets value and notifies all watchers         |
| `watch` | `(watcher: SignalWatcher<Value>) => () => void` | Register a watcher; returns unwatch          |

#### `SignalWatcher<Value>`

```ts
type SignalWatcher<Value> = (update: {
  value: Value;
  previousValue: Value;
}) => void;
```

Called synchronously on each `set` (or when a `signal.from` source notifies) with the new value and the value before that update.

### Behavior notes

- **Push-based:** Watchers run when the value is set or the external source notifies
- **Explicit watching:** Calling `get()` does not register dependencies
- **Synchronous:** All watchers run inline during `set` / source notification
- **Every set notifies:** Even when the new value is `===` to the previous one, watchers still run
