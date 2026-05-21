import type { LogRecord } from '../types.js';
/**
 * Class for batch processing log records
 *
 * LogBatch allows collecting multiple log records and sending them
 * in a batch operation, which can be more efficient for some transport
 * mechanisms, especially remote logging services.
 */
export declare class LogBatch {
    private autoFlushMs;
    /**
     * Array of log records to be processed in batch
     */
    private records;
    /**
     * Maximum size of the batch before auto-flushing
     */
    private maxBatchSize;
    /**
     * Timeout ID for scheduled flush
     */
    private flushTimeoutId?;
    /**
     * Creates a new LogBatch instance
     * @param maxBatchSize - Maximum number of records before auto-flush (default: 100)
     * @param autoFlushMs - Time in milliseconds for auto-flush (default: 5000)
     */
    constructor(maxBatchSize?: number, autoFlushMs?: number);
    /**
     * Adds a log record to the batch
     * @param record - The log record to add (must include _level)
     */
    add(record: LogRecord): void;
    /**
     * Flushes all records in the batch
     * @returns Promise that resolves when all records are processed
     */
    flush(): Promise<void>;
    /**
     * Gets the current count of records in the batch
     */
    get count(): number;
    /**
     * Disposes of the batch, flushing any remaining records
     */
    dispose(): Promise<void>;
}
//# sourceMappingURL=log-batch.d.ts.map