## `error`

- 📦 Below 875 Bytes minified + compressed (brotli)
- ✅ Zero dependencies

Define namespaced, serializable error classes grouped into domains. Domains are themselves classes, so `instanceof` works against a whole domain (or sub-domain), not just a single error. Errors round-trip through `JSON.stringify`/`errors.parse` without losing their class identity.

### Basic usage

```ts
import { errors } from "@peerigon/typescript-toolkit/error";

const HttpErrors = errors.domain("Http");

const { NotFound, Unauthorized } = HttpErrors.define({
  NotFound: {
    context: { httpStatus: 404 },
    message: (context: { httpStatus: number; resource: string }) =>
      `${context.resource} not found`,
  },
  Unauthorized: {
    context: { httpStatus: 401 },
    message: "Unauthorized",
  },
});

const error = new NotFound({ resource: "user" });

error.code; // "Http.NotFound"
error.name; // "NotFound"
error.message; // "user not found"
error.context; // { httpStatus: 404, resource: "user" }
error.stack; // present, a real Error stack

error instanceof NotFound; // true
error instanceof HttpErrors; // true — instanceof works against the whole domain
error instanceof Error; // true
```

### Merging context

Context comes from three places, later ones winning on key clashes: domain defaults → per-error defaults → whatever you pass when constructing the error.

```ts
const BillingErrors = errors.domain("Billing", {
  context: { service: "billing-api" },
});

const { PaymentFailed } = BillingErrors.define({
  PaymentFailed: {
    context: { httpStatus: 402 },
    message: "Payment failed",
  },
});

const error = new PaymentFailed({ httpStatus: 500 });

error.context; // { service: "billing-api", httpStatus: 500 }
```

### Sub-domains

```ts
const ClientErrors = HttpErrors.domain("Client");
const { BadRequest } = ClientErrors.define({
  BadRequest: { message: "Bad request" },
});

const error = new BadRequest({});

error.code; // "Http.Client.BadRequest"
error instanceof ClientErrors; // true
error instanceof HttpErrors; // true — still true for the parent domain
```

Domains are abstract — `new HttpErrors()` throws. Only errors created via `.define()` can be instantiated.

### Serialization

```ts
const json = JSON.stringify(error); // calls error.toJSON() automatically
const restored = errors.parse(json); // accepts a JSON string or an already-parsed object

restored instanceof NotFound; // true, if NotFound is still registered
```

If the code isn't registered (e.g. it came from another service or an older deploy), `parse()` falls back to `UnknownError` instead of throwing — it still carries the original code, message, context, and stack.

Stack traces are only serialized in dev by default (`errors.serialize.includeStack`, itself defaulting to `isDev`), so production error payloads don't leak stack traces unless you opt in:

```ts
errors.serialize.includeStack = false; // control it globally
error.toJSON({ includeStack: true }); // or override per call
```

### API Reference

#### `errors.domain(name, options?)`

Defines a root error domain.

```ts
errors.domain<DomainDefaults>(name: string, options?: DomainOptions<DomainDefaults>): ErrorDomain<DomainDefaults>
```

| Parameter | Type                 | Description                                                            |
| --------- | -------------------- | ---------------------------------------------------------------------- |
| `name`    | `string`             | The domain's name. Used verbatim as the code prefix and the class name |
| `options` | `DomainOptions<...>` | Optional `context` defaults and `separator`                            |

**Throws:** `Error` when `name` was already used for another root domain

#### `DomainOptions`

| Property    | Type     | Default | Description                                                                          |
| ----------- | -------- | ------- | ------------------------------------------------------------------------------------ |
| `context`   | `object` | `{}`    | Default context merged into every error defined in this domain (and its sub-domains) |
| `separator` | `string` | `"."`   | Separator between namespace segments. Only settable at the root domain               |

#### `ErrorDomain.domain(name, options?)`

Defines a nested sub-domain, namespaced under this domain.

```ts
domain(name: string, options?: { context?: object }): ErrorDomain<...>
```

Errors defined within the returned sub-domain are also `instanceof` every ancestor domain.

#### `ErrorDomain.define(options)`

Defines one or more error classes within this domain, keyed by code.

```ts
define<Options>(options: Options): { [K in keyof Options]: new (context) => DefinedErrorInstance }
```

| Parameter | Type                                 | Description                                                    |
| --------- | ------------------------------------ | -------------------------------------------------------------- |
| `options` | `Record<string, DefineErrorOptions>` | One entry per error, keyed by code (used verbatim as the name) |

**Returns:** An object with one generated error class per key

**Throws:** `Error` when a code was already used within this domain

#### `DefineErrorOptions`

| Property  | Type                              | Description                                                                    |
| --------- | --------------------------------- | ------------------------------------------------------------------------------ |
| `context` | `object`                          | Define-time defaults, merged under domain defaults and over by runtime context |
| `message` | `string \| ((context) => string)` | A static message, or a function deriving one from the fully merged context     |

#### `errors.parse(serialized)`

Reconstructs an error from a `toJSON()` snapshot, or its JSON string form.

```ts
errors.parse(serialized: string | SerializedError): DefinedErrorInstance | UnknownError
```

Accepts either a JSON string (calls `JSON.parse()` on it first) or an already-parsed `SerializedError` object. Reconstructs an exact snapshot — it does not re-run the original class's constructor logic (so it can't drift from what was serialized, even if the class's `message` function has since changed). Falls back to `UnknownError` when the code isn't registered.

#### `errors.serialize`

```ts
errors.serialize: { includeStack: boolean }
```

Mutable global default for whether `toJSON()` includes the stack trace. Defaults to `isDev`.

### Type Reference

#### `SerializedError`

```ts
type SerializedError = {
  code: string;
  name: string;
  message: string;
  context: Record<string, unknown>;
  stack: string | undefined;
};
```

#### `UnknownError`

A plain `Error` subclass used by `parse()` as a fallback. Carries `code` and `context` like any other defined error, but isn't tied to a specific domain.
