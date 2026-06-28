## `namespace`

- 📦 Below 265 Bytes minified + compressed (brotli)
- ✅ Zero dependencies

Define hierarchical namespaces and claim members exclusively within a parent namespace. Each claim returns a child namespace whose prefix grows as members are joined.

### Basic usage

```ts
import { namespace } from "@peerigon/typescript-toolkit/namespace";

const myNamespace = namespace.define();

const a = myNamespace.claim("a");
const ab = a.claim("b");

ab.toString(); // "a.b"

myNamespace.claim("a"); // throws: member already claimed
```

### Custom prefix and separator

```ts
const root = namespace.define({
  prefix: ["app", "v1"],
  separator: "/",
});

const feature = root.claim("auth");
feature.toString(); // "app/v1/auth"
```

### API Reference

#### `namespace.define(options?)`

Creates a root namespace.

```ts
namespace.define(options?: NamespaceOptions): Namespace
```

| Parameter | Type               | Description                                                          |
| --------- | ------------------ | -------------------------------------------------------------------- |
| `options` | `NamespaceOptions` | Optional configuration. Defaults to `{ prefix: "", separator: "." }` |

**Returns:** A new `Namespace` instance

#### `NamespaceOptions`

| Property    | Type                          | Default | Description                                                   |
| ----------- | ----------------------------- | ------- | ------------------------------------------------------------- |
| `prefix`    | `string \| readonly string[]` | `""`    | Initial prefix. Arrays are joined with `separator` before use |
| `separator` | `string`                      | `"."`   | Separator between prefix segments and between claimed members |

#### `Namespace.claim(member)`

Claims a member within this namespace.

```ts
claim(member: string): Namespace
```

| Parameter | Type     | Description                            |
| --------- | -------- | -------------------------------------- |
| `member`  | `string` | Member name to claim in this namespace |

**Returns:** A child `Namespace` whose prefix is this prefix joined with `member`

**Throws:** `Error` when `member` was already claimed on this namespace; `cause` is `{ prefix, member }`

#### `Namespace.toString()`

Returns the namespace prefix string.

```ts
toString(): string
```

**Returns:** The current prefix
