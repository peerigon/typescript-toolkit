## `signals`

- 📦 Below 250 Bytes
- ✅ Zero dependencies

Minimal writable state cell with explicit subscribers. Reads are synchronous getters; writes push `{ value, previousValue }` to every registered reader.

Use `signal.from` to mirror values from an external source (DOM events, timers, other stores) with ref-counted subscription — the source is only wired while at least one reader is subscribed.

### Basic usage

```ts
import { signal } from "@peerigon/typescript-toolkit/signals";

const count = signal(0);

const unsubscribe = count.subscribe(({ value, previousValue }) => {
  console.log(value, previousValue);
});

count.write(1);
count.read(); // 1

unsubscribe();
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

const unsubscribe = windowWidth.subscribe(({ value }) => {
  console.log("width", value);
});
```

`signal.from` returns a read-only signal (no `write`). When the source calls `notify`, the current value is re-read and subscribers are updated.

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

  windowWidth.subscribe(({ value }) => {
    console.log("width", value);
  });
} // dispose clears subscribers and removes the resize listener
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

**Returns:** `Signal<Value>` — `read`, `write`, `subscribe`, and `[Symbol.dispose]`

#### `signal.from(readFromSource, subscribeToSource)`

Create a read-only signal backed by an external source.

```ts
signal.from<Value>(
  readFromSource: () => Value,
  subscribeToSource: (notify: () => void) => () => void,
): Omit<Signal<Value>, "write">
```

| Parameter           | Type                                 | Description                                                                                |
| ------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------ |
| `readFromSource`    | `() => Value`                        | Called to read the current value when the source notifies or on first setup                |
| `subscribeToSource` | `(notify: () => void) => () => void` | Subscribe to the source; call `notify` when the value may have changed; return unsubscribe |

**Returns:** `Omit<Signal<Value>, "write">` — `read`, `subscribe`, and `[Symbol.dispose]`

**Subscription lifecycle:** The source `subscribeToSource` runs when the first reader subscribes and its unsubscribe runs when the last reader unsubscribes.

#### `signal.read` / `signal.write` / `signal.subscribe`

| Member      | Type                                          | Description                                      |
| ----------- | --------------------------------------------- | ------------------------------------------------ |
| `read`      | `ReadSignal<Value>`                           | `()` returns current value; also has `subscribe` |
| `write`     | `(value: Value) => void`                      | Sets value and notifies all readers              |
| `subscribe` | `(reader: SignalReader<Value>) => () => void` | Register a reader; returns unsubscribe           |

#### `SignalReader<Value>`

```ts
type SignalReader<Value> = (update: {
  value: Value;
  previousValue: Value;
}) => void;
```

Called synchronously on each `write` (or when a `signal.from` source notifies) with the new value and the value before that update.

### Behavior notes

- **Push-based:** Subscribers run when the value is written or the external source notifies, not when `read` is called
- **Explicit subscription:** Calling `read()` does not register dependencies
- **Synchronous:** All readers run inline during `write` / source notification
- **Every write notifies:** Even when the new value is `===` to the previous one, subscribers still run
