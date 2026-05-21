/**
 * Logger class for structured logging with severity levels and attributes
 */
import type { Attributes, Body, LogRecord, SeverityKind } from './types.js';
type LogLevelMethod = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export declare class Logger {
    private readonly name?;
    private readonly attributes?;
    private severity;
    private traceId?;
    private spanId?;
    private logBatch?;
    /**
     * Creates a new logger instance
     * @param name - Optional name for the logger
     * @param attributes - Optional default attributes to include with all logs
     */
    constructor(name?: string | undefined, attributes?: Attributes | undefined);
    /**
     * Sets the severity level for this logger
     * @param severity - The severity level to set
     */
    setSeverity(severity: SeverityKind): void;
    /**
     * Sets the trace context for distributed tracing
     * @param traceId - The trace ID
     * @param spanId - Optional span ID
     */
    setTraceContext(traceId: string, spanId?: string): void;
    /**
     * Enables batch logging for this logger instance
     */
    enableBatchLogging(): void;
    /**
     * Disables batch logging for this logger instance
     * This will flush any pending log records
     */
    disableBatchLogging(): Promise<void>;
    /**
     * Manually flushes any batched log records
     * No-op if batch logging is not enabled
     */
    flush(): Promise<void>;
    /**
     * Creates a new logger with an attribute added to the context
     * @param key - Attribute key
     * @param value - Attribute value
     * @returns A new logger instance with the attribute
     */
    withAttribute(key: string, value: Attributes[string]): Logger;
    /**
     * Logs a message at TRACE level
     * @param body - The message or data to log
     * @param attributes - Optional attributes to include with this log entry
     */
    trace(body: Body, attributes?: Attributes): void;
    /**
     * Logs a message at DEBUG level
     * @param body - The message or data to log
     * @param attributes - Optional attributes to include with this log entry
     */
    debug(body: Body, attributes?: Attributes): void;
    /**
     * Logs a message at INFO level
     * @param body - The message or data to log
     * @param attributes - Optional attributes to include with this log entry
     */
    info(body: Body, attributes?: Attributes): void;
    /**
     * Logs a message at WARN level
     * @param body - The message or data to log
     * @param attributes - Optional attributes to include with this log entry
     */
    warn(body: Body, attributes?: Attributes): void;
    /**
     * Logs a message at ERROR level
     * @param body - The message or data to log
     * @param attributes - Optional attributes to include with this log entry
     */
    error(body: Body, attributes?: Attributes): void;
    /**
     * Logs a message at FATAL level
     * @param body - The message or data to log
     * @param attributes - Optional attributes to include with this log entry
     */
    fatal(body: Body, attributes?: Attributes): void;
    /**
     * Creates a child logger with the given name and optional attributes
     * @param name - Name for the child logger
     * @param attributes - Optional attributes to merge with parent attributes
     * @returns A new child logger instance
     */
    child(name: string, attributes?: Attributes): Logger;
    /**
     * Routes a log record to the appropriate destination (batch or direct)
     * @param level - The log level
     * @param record - The log record
     */
    private logWithLevel;
    /**
     * Logs a record with error handling
     * @param level - The log level method name
     * @param record - The log record to write
     */
    protected logWithErrorHandling(level: LogLevelMethod, record: LogRecord): void;
    /**
     * Builds a log record with all necessary fields
     * @param severityType - The severity level
     * @param body - The message or data to log
     * @param attributes - Optional attributes to include
     * @returns A complete log record
     */
    protected buildRecord(severityType: SeverityKind, body: Body, attributes?: Attributes): LogRecord;
    /**
     * Builds a fully qualified logger name
     * @param name - Optional name to append
     * @returns The complete logger name
     */
    protected getName(name?: string): string | undefined;
    /**
     * Merges default attributes with per-log attributes
     * @param attributes - Optional attributes to merge
     * @returns Merged attributes or undefined
     */
    protected mergeAttributes(attributes?: Attributes): Attributes | undefined;
}
export {};
//# sourceMappingURL=logger.d.ts.map