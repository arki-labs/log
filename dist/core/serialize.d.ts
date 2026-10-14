import type { Fields, Value } from './types.js';
/** How deep `serializeError` walks causes, aggregate members and nested values. */
export declare const MAX_ERROR_DEPTH = 8;
/**
 * Turns an `Error` into plain fields (RFC §5.3): `name`, `message`, `stack`,
 * `code`, own enumerable fields, the `cause` chain and `AggregateError.errors`.
 * Depth and cycles are bounded. Own accessors are never called, except the
 * engine's `stack`, `name` and `message`, which are read inside `try`.
 */
export declare function serializeError(error: Error): Fields;
/** Converts anything into a `Value`, bounding depth and cycles and never calling getters. */
export declare function toValue(value: unknown, depth: number, seen: Set<object>): Value;
//# sourceMappingURL=serialize.d.ts.map