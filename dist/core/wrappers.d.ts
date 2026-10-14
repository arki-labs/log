import type { LevelName } from './levels.js';
import type { LogRecord, Sink } from './types.js';
/**
 * Monolog's fingers-crossed handler (RFC §7.1). Records from `captureFrom` up
 * are kept in a bounded ring. A record at `triggerAt` or above writes the
 * ring in order, then itself; later records in that scope pass straight
 * through. With `scope: 'context'` there is one ring per `withContext` scope
 * (records outside any scope share the global ring); a scope that ends
 * without an error leaves its ring to be garbage-collected.
 */
export declare function fingersCrossed(sink: Sink, options?: {
    readonly triggerAt?: LevelName;
    readonly captureFrom?: LevelName;
    readonly maxRecords?: number;
    readonly scope?: 'context' | 'global';
}): Sink;
/**
 * Batches records and writes them to `sink` every `flushIntervalMs`, in order.
 * When `maxRecords` are waiting, `overflow` says which record is dropped.
 */
export declare function buffer(sink: Sink, options?: {
    readonly maxRecords?: number;
    readonly flushIntervalMs?: number;
    readonly overflow?: 'drop-oldest' | 'drop-newest';
}): Sink;
/**
 * Writes the same record (by `key`, default level + category + template) once
 * per `windowMs`. When the window closes, a summary record says how many were
 * suppressed.
 */
export declare function deduplicate(sink: Sink, options?: {
    readonly windowMs?: number;
    readonly key?: (record: LogRecord) => string;
}): Sink;
//# sourceMappingURL=wrappers.d.ts.map