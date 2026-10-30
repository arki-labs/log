import type { FailureLike, Fields, Value } from './types.js';
/** How deep `serializeError` walks causes, aggregate members and nested values. */
export declare const MAX_ERROR_DEPTH = 8;
/** Longest cause chain `serializeFailure` lists: the limit `findCause` in `@arki/failure` walks. */
export declare const MAX_CAUSE_LINKS = 64;
/**
 * Turns an `Error` into plain fields (RFC §5.3): `name`, `message`, `stack`,
 * `code`, own enumerable fields, the `cause` chain and `AggregateError.errors`.
 * Depth and cycles are bounded. Own accessors are never called, except the
 * engine's `stack`, `name` and `message`, which are read inside `try`.
 */
export declare function serializeError(error: Error): Fields;
/**
 * True for a failure value from `@arki/failure`. Seen by its brand, the
 * `'~failure'` key on its prototype, so `@arki/log` keeps zero dependencies.
 * The same check as `isFailure`.
 */
export declare function isFailureLike(value: unknown): value is FailureLike;
/**
 * Turns a failure from `@arki/failure` into plain fields: `code`, `message`,
 * `status`, `data`, `remediation`, and `causes`, its cause chain as a list
 * from nearest to root. A link is a failure's fields or an error's fields;
 * an error's own causes join the same list. The list stops after
 * {@link MAX_CAUSE_LINKS} links (`'[MaxDepth]'`) or at a cycle (`'[Circular]'`).
 */
export declare function serializeFailure(failure: FailureLike): Fields;
/** Converts anything into a `Value`, bounding depth and cycles and never calling getters. */
export declare function toValue(value: unknown, depth: number, seen: Set<object>): Value;
//# sourceMappingURL=serialize.d.ts.map