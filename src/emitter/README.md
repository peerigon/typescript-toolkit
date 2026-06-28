## `emitter`

- 📦 Below 275 Bytes minified + compressed (brotli)
- ✅ Zero dependencies

Minimal typed event emitter where each event maps to a single payload object. Listeners receive one payload argument with a `target` property pointing to the emitter — no arbitrary extra parameters.

If an `error` event is emitted with no listeners, the `error` is thrown.

### Basic usage

```ts
import { Emitter } from "@peerigon/typescript-toolkit/emitter";

const emitter = new Emitter<{
  click: { x: number; y: number };
  message: { text: string };
}>();

const remove = emitter.on("click", ({ x, y, target }) => {
  console.log(x, y, target);
});

emitter.emit("click", { x: 1, y: 2 });
remove();
```

Unsubscribe functions are `Disposable`. With [`using`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/using), cleanup runs when the block ends:

```ts
{
  using unsubscribe = emitter.on("click", ({ x, y }) => console.log(x, y));
}
// Won't log 3, 4 because the listener was removed by the using declaration
emitter.emit("click", { x: 3, y: 4 });
```

### Prefer composition over subclassing

Prefer **composition** over `extends Emitter`. Subclassing makes `emit` public on every instance and ties your type to a single base class — awkward when you already extend something else or want a narrow public API.

Instead, keep a **private** `Emitter` and expose only its subscribe facade `events` on the instance:

```ts
class ChatRoom implements Emitter.Events {
  #emitter = new Emitter<{
    message: { text: string };
  }>();

  readonly events = this.#emitter.events;

  post(text: string) {
    this.#emitter.emit("message", { text });
  }
}

const room = new ChatRoom();
room.events.on("message", ({ text }) => console.log(text));
room.post("hello");
```

### Error events

```ts
const emitter = new Emitter<{
  click: { x: number; y: number };
  error: { error: Error };
}>();

emitter.on("error", ({ error, target }) => {
  console.error(error, target);
});

// With no listener, this throws the `error` property
emitter.emit("error", { error: new Error("Something went wrong") });
```

### API Reference

#### `new Emitter<Payloads>()`

Create an emitter for a record of event names and payload object types (without `target`). When `error` is included, its payload must be `{ error: Error }`. Listeners receive payloads with `target` set to the emitter.

| Type parameter | Description                                      |
| -------------- | ------------------------------------------------ |
| `Events`       | Map of event names to their payload object types |

**Error events:** If `Events` includes `error`, `Events["error"]` must be `{ error: Error }`. Emitting `error` with no listeners throws `payload.error`.

#### `emitter.on(event, listener)`

Register a listener for an event. Returns a function that removes the listener.

```ts
on<EventName extends keyof Events>(
  event: EventName,
  listener: (payload: Emitter.EventPayload<Events, EventName>) => void,
): () => void
```

| Parameter  | Type                                                         | Description                                      |
| ---------- | ------------------------------------------------------------ | ------------------------------------------------ |
| `event`    | `EventName`                                                  | Event name                                       |
| `listener` | `(payload: Emitter.EventPayload<Events, EventName>) => void` | Called with the event payload including `target` |

**Returns:** `Emitter.Unsubscribe` — call to unsubscribe, or use with `using` / `[Symbol.dispose]()`

#### `emitter.once(event, listener)`

Register a listener that runs at most once. It is removed automatically when the event is emitted.

```ts
once<EventName extends keyof Events>(
  event: EventName,
  listener: (payload: Emitter.EventPayload<Events, EventName>) => void,
): () => void
```

Same parameters and return value as `on`. Also available as `events.once`.

#### `emitter.emit(event, payload)`

Emit a payload to all listeners registered for an event. `target` is added automatically. For `error` with no listeners, throws `payload.error`.

```ts
emit<EventName extends keyof Events>(
  event: EventName,
  payload: Events[EventName],
): void
```

| Parameter | Type                | Description                                     |
| --------- | ------------------- | ----------------------------------------------- |
| `event`   | `EventName`         | Event name                                      |
| `payload` | `Events[EventName]` | Payload object without `target` (added on emit) |

**Returns:** `void` — throws when emitting `error` with no listeners

#### `emitter.events`

Subscribe-only facade with `on` bound to the emitter. The emitter implements `Emitter.Events<Payloads>`. Use this object (or assign it to a class field) when consumers should register listeners but not emit.

| Property / method | Type           | Description                      |
| ----------------- | -------------- | -------------------------------- |
| `events.on`       | `emitter.on`   | Same signature as `emitter.on`   |
| `events.once`     | `emitter.once` | Same signature as `emitter.once` |

No `emit` on this object — see [Events on class instances (composition)](#events-on-class-instances-composition).
