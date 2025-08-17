# CLAUDE.md

**Important**: You **must** follow the rules at `./node_modules/@peerigon/configs/ai/rules.mdc` and its language-specific rules referenced in that file.

## Project Overview

Fractals-TypeScript is a collection of small, focused TypeScript utility functions. Each utility is designed to be tree-shakeable and lives in its own sub-package (e.g., `@peerigon/fractals-typescript/match`).

## Essential Commands

### Development

- `npm test` - Run all tests (format, types, unit) in parallel
- `npm run vitest` - Run unit tests in watch mode for development
- `npm run test:unit` - Run unit tests once
- `npm run test:types` - Run TypeScript type checking
- `npm run test:format` - Check code formatting

### Building

- `npm run build` - Build the project (clears dist and compiles TypeScript)

### Release

- `npm run release` - Create a new release using semantic-release (requires proper CI setup)

## Architecture

This is a **utility library** where each function is:

- Located in its own directory under `/src`
- Exported as a sub-package (e.g., `/match`, `/assert`)
- Accompanied by tests (`*.test.ts`) and often a README
- Tree-shakeable with no default exports

Current utilities include:

- `match` - Pattern matching with TypeScript exhaustiveness
- `assert` - Type assertion helpers
- `result` - Result type for error handling
- `async` - Async utilities
- `reject` - Error throwing utilities
- `need` - Required value utilities
- `unwrap` - Unwrapping utilities
- `enums` - Enum utilities
- `dedupe` - Deduplication utilities

## Key Development Notes

1. **No default exports** - All exports must be named (enforced by ESLint)
2. **Sub-package pattern** - Each utility has its own export path configured in package.json
3. **Test alongside code** - Tests are colocated with implementation files
4. **Shared configs** - Uses `@peerigon/configs` for ESLint and TypeScript settings
5. **Semantic commits** - Follow conventional commits for automated releases

## Adding New Utilities

When adding a new utility:

1. Create a new directory under `/src`
2. Add the implementation file(s)
3. Add tests in the same directory
4. Update package.json exports to include the new sub-package
5. Add a `README.md` in `/src/<utility-name>.md`. Use `./src/assert/README.md` as blueprint.
6. Update the main `README.md` and `CLAUDE.md`

## Running Single Tests

To run a specific test file:

```bash
npm run vitest -- path/to/test.test.ts
```

To run tests matching a pattern:

```bash
npm run vitest -- -t "pattern"
```
