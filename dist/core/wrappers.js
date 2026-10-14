import { Level } from './levels.js';
import { deliver } from './pipeline.js';
import { recordScope, updateRecord } from './record.js';
/**
 * Monolog's fingers-crossed handler (RFC §7.1). Records from `captureFrom` up
 * are kept in a bounded ring. A record at `triggerAt` or above writes the
 * ring in order, then itself; later records in that scope pass straight
 * through. With `scope: 'context'` there is one ring per `withContext` scope
 * (records outside any scope share the global ring); a scope that ends
 * without an error leaves its ring to be garbage-collected.
 */
export function fingersCrossed(sink, options = {}) {
    const trigger = Level[options.triggerAt ?? 'error'];
    const maxRecords = options.maxRecords ?? 200;
    const perContext = (options.scope ?? 'context') === 'context';
    const global = { records: [], triggered: false };
    const rings = new WeakMap();
    const ringFor = (record) => {
        if (!perContext)
            return global;
        const scope = recordScope(record);
        if (scope === undefined)
            return global;
        let ring = rings.get(scope);
        if (ring === undefined) {
            ring = { records: [], triggered: false };
            rings.set(scope, ring);
        }
        return ring;
    };
    return {
        captureFrom: options.captureFrom ?? 'debug',
        write: record => {
            const ring = ringFor(record);
            if (ring.triggered) {
                deliver(sink, record);
                return;
            }
            if (record.level >= trigger) {
                ring.triggered = true;
                const held = ring.records;
                ring.records = [];
                for (const previous of held)
                    deliver(sink, previous);
                deliver(sink, record);
                return;
            }
            ring.records.push(record);
            if (ring.records.length > maxRecords)
                ring.records.shift();
        },
        flush: () => sink.flush?.(),
        close: () => sink.close?.(),
    };
}
/**
 * Batches records and writes them to `sink` every `flushIntervalMs`, in order.
 * When `maxRecords` are waiting, `overflow` says which record is dropped.
 */
export function buffer(sink, options = {}) {
    const maxRecords = options.maxRecords ?? 1000;
    const interval = options.flushIntervalMs ?? 1000;
    const dropNewest = options.overflow === 'drop-newest';
    let queue = [];
    let timer;
    const drain = () => {
        if (timer !== undefined)
            clearTimeout(timer);
        timer = undefined;
        const batch = queue;
        queue = [];
        for (const record of batch)
            deliver(sink, record);
    };
    return {
        write: record => {
            if (queue.length >= maxRecords) {
                if (dropNewest)
                    return;
                queue.shift();
            }
            queue.push(record);
            if (timer === undefined)
                timer = unref(setTimeout(drain, interval));
        },
        flush: () => {
            drain();
            return sink.flush?.();
        },
        close: async () => {
            drain();
            await sink.flush?.();
            await sink.close?.();
        },
    };
}
/**
 * Writes the same record (by `key`, default level + category + template) once
 * per `windowMs`. When the window closes, a summary record says how many were
 * suppressed.
 */
export function deduplicate(sink, options = {}) {
    const windowMs = options.windowMs ?? 60_000;
    const keyOf = options.key ?? ((record) => `${String(record.level)}\u0000${record.category}\u0000${record.template}`);
    const windows = new Map();
    let timer;
    const close = (key, window, now) => {
        windows.delete(key);
        if (window.suppressed === 0)
            return;
        deliver(sink, updateRecord(window.sample, {
            time: now,
            template: '{suppressed} duplicate records suppressed: {original}',
            fields: { suppressed: window.suppressed, original: window.sample.template, windowMs },
            error: undefined,
            eventName: undefined,
            body: undefined,
        }));
    };
    const sweep = (now) => {
        for (const [key, window] of windows)
            if (now >= window.until)
                close(key, window, now);
    };
    const schedule = () => {
        if (timer !== undefined || windows.size === 0)
            return;
        let next = Number.POSITIVE_INFINITY;
        for (const window of windows.values())
            next = Math.min(next, window.until);
        timer = unref(setTimeout(() => {
            timer = undefined;
            sweep(Date.now());
            schedule();
        }, Math.max(0, next - Date.now())));
    };
    return {
        write: record => {
            const now = Date.now();
            sweep(now);
            const key = keyOf(record);
            const open = windows.get(key);
            if (open !== undefined) {
                open.suppressed++;
                return;
            }
            windows.set(key, { until: now + windowMs, suppressed: 0, sample: record });
            deliver(sink, record);
            schedule();
        },
        flush: () => {
            const now = Date.now();
            for (const [key, window] of windows)
                close(key, window, now);
            return sink.flush?.();
        },
        close: async () => {
            if (timer !== undefined)
                clearTimeout(timer);
            timer = undefined;
            const now = Date.now();
            for (const [key, window] of windows)
                close(key, window, now);
            await sink.flush?.();
            await sink.close?.();
        },
    };
}
/** Lets Node exit while a timer is pending; a no-op where timers are numbers. */
function unref(timer) {
    if (typeof timer === 'object' && 'unref' in timer)
        timer.unref();
    return timer;
}
//# sourceMappingURL=wrappers.js.map