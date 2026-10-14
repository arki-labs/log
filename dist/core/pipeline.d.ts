import type { ContextStore, LogRecord, Sink } from './types.js';
/**
 * Hands a record to a sink: the sink's own level floor, then its own
 * processors, then `write`. Wrappers use it for the sink they wrap. It never
 * throws: a failing processor drops the record (it may be a redactor), and a
 * failing sink loses only its own copy.
 */
export declare function deliver(sink: Sink, record: LogRecord): void;
/**
 * The core's context store: correct for synchronous code only. A scope ends
 * when its callback returns, so an `await` inside loses it. Install
 * `asyncContext()` from `@arki/log/node` for async code.
 */
export declare function syncContext(): ContextStore;
//# sourceMappingURL=pipeline.d.ts.map