import { configuration } from '../config.js';
/**
 * Class for batch processing log records
 *
 * LogBatch allows collecting multiple log records and sending them
 * in a batch operation, which can be more efficient for some transport
 * mechanisms, especially remote logging services.
 */
export class LogBatch {
    autoFlushMs;
    /**
     * Array of log records to be processed in batch
     */
    records = [];
    /**
     * Maximum size of the batch before auto-flushing
     */
    maxBatchSize;
    /**
     * Timeout ID for scheduled flush
     */
    flushTimeoutId;
    /**
     * Creates a new LogBatch instance
     * @param maxBatchSize - Maximum number of records before auto-flush (default: 100)
     * @param autoFlushMs - Time in milliseconds for auto-flush (default: 5000)
     */
    constructor(maxBatchSize = 100, autoFlushMs = 5000) {
        this.autoFlushMs = autoFlushMs;
        this.maxBatchSize = maxBatchSize;
    }
    /**
     * Adds a log record to the batch
     * @param record - The log record to add (must include _level)
     */
    add(record) {
        // Validate that _level is present
        if (!record._level) {
            console.error('LogBatch: record is missing _level property');
            return;
        }
        this.records.push(record);
        // Auto-flush if batch size exceeds maximum
        if (this.records.length >= this.maxBatchSize) {
            this.flush().catch(error => {
                console.error('Failed to flush log batch:', error);
            });
        }
        // Schedule auto-flush if not already scheduled
        if (!this.flushTimeoutId && this.autoFlushMs > 0) {
            this.flushTimeoutId = setTimeout(() => {
                this.flush().catch(error => {
                    console.error('Failed to auto-flush log batch:', error);
                });
                this.flushTimeoutId = undefined;
            }, this.autoFlushMs);
        }
    }
    /**
     * Flushes all records in the batch
     * @returns Promise that resolves when all records are processed
     */
    async flush() {
        if (this.records.length === 0) {
            return;
        }
        // Clear any scheduled flush
        if (this.flushTimeoutId) {
            clearTimeout(this.flushTimeoutId);
            this.flushTimeoutId = undefined;
        }
        // Group records by level
        const recordsByLevel = {
            trace: [],
            debug: [],
            info: [],
            warn: [],
            error: [],
            fatal: [],
        };
        for (const record of this.records) {
            const level = record._level;
            // Create a clean record without the _level property
            const recordCopy = { ...record };
            delete recordCopy._level;
            // Add to the appropriate level group
            recordsByLevel[level].push(recordCopy);
        }
        // Log records by severity
        for (const level of Object.keys(recordsByLevel)) {
            const records = recordsByLevel[level];
            if (records.length > 0) {
                try {
                    // Process each record with its level
                    for (const record of records) {
                        configuration.transport[level](record);
                    }
                }
                catch (error) {
                    console.error(`Failed to log batch of ${level} messages:`, error);
                }
            }
        }
        // Clear records after processing
        this.records = [];
    }
    /**
     * Gets the current count of records in the batch
     */
    get count() {
        return this.records.length;
    }
    /**
     * Disposes of the batch, flushing any remaining records
     */
    async dispose() {
        await this.flush();
        if (this.flushTimeoutId) {
            clearTimeout(this.flushTimeoutId);
            this.flushTimeoutId = undefined;
        }
    }
}
//# sourceMappingURL=log-batch.js.map