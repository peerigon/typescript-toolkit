- Check for useQuery compatibility
- Add missing documentation (cross-links & examples, like enums + match)
- Badge with kb for each export (size-limit)?
- Use `interface` instead of `type`?

## shape

- Implement a simple shape matcher

## match

- Extend match to also return .shape(). If the shape() function receives a function as value, call it with the matched shape

## result / async

- Merge Async + Result
- Result.Pending with Promise
- Result with Metadata
- Implement result.case (adjust docs "Pattern matching with status")

## error

- Make fully deseriazable
- Match for error codes
- Casing convention
- Split Private / Public context
