import type { LevelName } from './levels.js';
import type { Fields, LogRecord, TraceContext, Value } from './types.js';
export declare const EMPTY_FIELDS: Fields;
/** Fields bound with `.with()`, plus their JSON, written once and reused (the "chindings" trick). */
export type BoundFields = {
    readonly fields: Fields;
    json: string | undefined;
};
/**
 * The one object a log call allocates. Fields stay in their layers (shared,
 * bound, scoped, call) and are merged only when something reads `fields`, so
 * a JSON sink can write the bound layer from its cached JSON instead.
 */
export declare class LogEntry implements LogRecord {
    readonly time: number;
    readonly level: number;
    readonly levelName: LevelName;
    readonly category: string;
    readonly template: string;
    readonly eventName: string | undefined;
    readonly body: Value;
    readonly error: Error | undefined;
    readonly traceId: string | undefined;
    readonly spanId: string | undefined;
    readonly traceFlags: number | undefined;
    readonly resource: Fields;
    /** The `withContext` scope this record was logged in; `fingersCrossed` keys its rings on it. */
    readonly scope: Fields | undefined;
    /** Layers in precedence order (later wins). `undefined` when built by `updateRecord`. */
    readonly shared: Fields | undefined;
    readonly bound: BoundFields | undefined;
    readonly call: Fields | undefined;
    /** True when built by a log call: the fields are still in their layers and no processor replaced them. */
    readonly layered: boolean;
    private merged;
    private rendered;
    constructor(time: number, level: number, category: string, template: string, shared: Fields | undefined, bound: BoundFields | undefined, scope: Fields | undefined, call: Fields | undefined, error: Error | undefined, trace: TraceContext | undefined, resource: Fields, eventName: string | undefined, body: Value, merged: Fields | undefined);
    get fields(): Fields;
    message(): string;
}
/** Merges field layers; later layers win. Allocates only when two or more layers are present. */
export declare function mergeLayers(a: Fields | undefined, b: Fields | undefined, c: Fields | undefined, d: Fields | undefined): Fields;
/** What `updateRecord` may change. */
export type RecordChanges = {
    readonly time?: number;
    readonly level?: number;
    readonly template?: string;
    readonly eventName?: string;
    readonly body?: Value;
    readonly fields?: Fields;
    readonly error?: Error | undefined;
};
/**
 * A copy of a record with some parts replaced, for processors. The copy
 * renders its message from its own fields, so a redacted value never reaches
 * `message()`.
 */
export declare function updateRecord(record: LogRecord, changes: RecordChanges): LogRecord;
/** The `withContext` scope a record was logged in, if the core built it. */
export declare function recordScope(record: LogRecord): Fields | undefined;
//# sourceMappingURL=record.d.ts.map