import { json } from './formatters.js';
export function memorySink() {
    const records = [];
    return {
        records,
        write: record => {
            records.push(record);
        },
        clear: () => {
            records.length = 0;
        },
    };
}
/** Formats each record (JSON by default) and hands the line to `write`. */
export function lineSink(write, options = {}) {
    const format = options.format ?? json();
    return { write: record => write(format(record)) };
}
function consoleMethod(level) {
    if (level >= 17)
        return 'error';
    if (level >= 13)
        return 'warn';
    if (level >= 9)
        return 'info';
    return 'debug';
}
/**
 * Writes to `console`. With `format`, each record is one formatted line.
 * Without it (browser mode), the message is followed by the fields object and
 * the error, so devtools can expand them.
 */
export function consoleSink(options = {}) {
    const format = options.format;
    return {
        write: record => {
            const method = consoleMethod(record.level);
            if (format !== undefined) {
                console[method](format(record));
                return;
            }
            const head = `${record.levelName.toUpperCase()}${record.category === '' ? '' : ` [${record.category}]`} ${record.eventName ?? record.message()}`;
            const args = [head];
            if (record.body !== undefined)
                args.push(record.body);
            if (Object.keys(record.fields).length > 0)
                args.push(record.fields);
            if (record.error !== undefined)
                args.push(record.error);
            console[method](...args);
        },
    };
}
//# sourceMappingURL=sinks.js.map