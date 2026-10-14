import type { LoggerProvider } from '@opentelemetry/api-logs';
import type { Sink, TraceSource } from '../core/types.js';
/**
 * A trace source that reads the active span from `@opentelemetry/api` when a
 * record is built. Pass it as `configure({ trace: otelTrace() })`.
 */
export declare function otelTrace(): TraceSource;
/**
 * A sink that sends records to the OpenTelemetry Logs API. Each record keeps
 * its severity, its rendered message (or its structured body for `emit()`),
 * its fields as attributes plus `log.category` and `log.template`, its trace
 * ids, and the configured resource fields (as attributes; a record's own
 * fields win on a clash).
 */
export declare function otelSink(loggerProvider: LoggerProvider): Sink;
//# sourceMappingURL=index.d.ts.map