## `signals`

- 📦 Below 300 Bytes
- ✅ Zero dependencies

Minimal writable state cell with explicit watchers. Calling `set` pushes `{ new, old }` to every registered watcher.

Use `signal.from` to mirror values from an external source (DOM events, timers, other stores) with ref-counted watching — the source is only wired while at least one watcher is watching.

### Basic usage

```ts
import { signal } from "@peerigon/typescript-toolkit/signals";

const count = signal(0);

{
  using unwatch = count.watch((count) => {
    console.log(count.new, count.old);
  });

  count.set(1);
  count.get(); // 1
}
// unwatch() is called automatically when the block ends
// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/using
```

### Bridging an external source

```ts
const windowWidth = signal.from(
  () => window.innerWidth,
  (notify) => {
    // Call notify() to update the signal
    window.addEventListener("resize", notify);
    // Return a function that unsubscribes from the source
    return () => window.removeEventListener("resize", notify);
  },
);

const unwatch = windowWidth.watch((width) => {
  console.log("width", width.new);
});
```

`signal.from` returns a read-only signal (no `set`). When the source calls `notify`, the current value is read from the getter and watchers are updated.

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

  windowWidth.watch((width) => {
    console.log("width", width.new);
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

| Member  | Type                                               | Description                                  |
| ------- | -------------------------------------------------- | -------------------------------------------- |
| `get`   | `SignalGetter<Value>`                              | `()` returns current value; also has `watch` |
| `set`   | `(value: Value) => void`                           | Sets value and notifies all watchers         |
| `watch` | `(watcher: SignalWatcher<Value>) => SignalUnwatch` | Register a watcher; returns unwatch          |

#### `SignalUnwatch`

```ts
type SignalUnwatch = (() => void) & Disposable;
```

Returned by `watch`. Call it to unwatch, or use with `using` / `[Symbol.dispose]()`.

#### `SignalUpdate<Value>`

```ts
type SignalUpdate<Value> = {
  new: Value;
  old: Value;
};
```

Passed to watchers on each update with the new and previous values.

#### `SignalWatcher<Value>`

```ts
type SignalWatcher<Value> = (update: SignalUpdate<Value>) => void;
```

Called synchronously on each `set` (or when a `signal.from` source notifies) with the new and previous values.

### Behavior notes

- **Push-based:** Watchers run when the value is set or the external source notifies
- **Explicit watching:** Calling `get()` does not register dependencies
- **Synchronous:** All watchers run inline during `set` / source notification
- **Every set notifies:** Even when the new value is `===` to the previous one, watchers still run
