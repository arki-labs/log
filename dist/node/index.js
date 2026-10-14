// @arki/log/node: sinks, env and async context for Node, Bun and Deno.
// Importing does nothing: every factory does its work when called.
import { AsyncLocalStorage } from 'node:async_hooks';
import { closeSync, openSync, writeSync } from 'node:fs';
import process from 'node:process';
import { invalidLevelError } from '../core/errors.js';
import { json } from '../core/formatters.js';
import { Level } from '../core/levels.js';
/** Lines are written when this many characters are waiting, or on the next `setImmediate`. */
const FLUSH_AT = 16 * 1024;
const MAX_EAGAIN_RETRIES = 1000;
/**
 * A sink that formats each record as one line, buffers lines, and writes them
 * with `fs.writeSync` on `setImmediate` or at 16 KiB. It flushes
 * synchronously on process exit; the exit hook is registered here, by the
 * factory call, and removed by `close()`.
 */
function fdSink(fd, format, onClose) {
    let pending = '';
    let scheduled = false;
    let closed = false;
    const flushSync = () => {
        scheduled = false;
        if (pending === '')
            return;
        const data = Buffer.from(pending, 'utf8');
        pending = '';
        writeAll(fd, data);
    };
    const onTick = () => {
        if (scheduled)
            flushSync();
    };
    process.on('exit', flushSync);
    return {
        write: record => {
            if (closed)
                return;
            pending += `${format(record)}\n`;
            if (pending.length >= FLUSH_AT)
                flushSync();
            else if (!scheduled) {
                scheduled = true;
                setImmediate(onTick);
            }
        },
        flush: flushSync,
        close: () => {
            if (closed)
                return;
            flushSync();
            closed = true;
            process.removeListener('exit', flushSync);
            onClose?.();
        },
    };
}
function writeAll(fd, data) {
    let offset = 0;
    let retries = 0;
    while (offset < data.length) {
        try {
            offset += writeSync(fd, data, offset, data.length - offset);
            retries = 0;
        }
        catch (error) {
            // A non-blocking pipe that is full: try again, then give up rather than spin forever.
            if (isErrno(error, 'EAGAIN') && retries < MAX_EAGAIN_RETRIES) {
                retries++;
                continue;
            }
            throw error;
        }
    }
}
function isErrno(error, code) {
    return error instanceof Error && 'code' in error && error.code === code;
}
/** Writes lines (JSON by default) to standard output. */
export function stdout(options = {}) {
    return fdSink(1, options.format ?? json());
}
/** Writes lines (JSON by default) to standard error. */
export function stderr(options = {}) {
    return fdSink(2, options.format ?? json());
}
/** Appends lines (JSON by default) to a file, opened when this is called. */
export function file(options) {
    const fd = openSync(options.path, 'a');
    return fdSink(fd, options.format ?? json(), () => closeSync(fd));
}
/**
 * Reads the environment, only when called (RFC §8.5): `LOG_LEVEL` (the
 * default level), `DEBUG` (`arki:kv:*,-arki:kv:noisy`: each match lowers that
 * category to `debug`; `-` excludes) and `NO_COLOR`. Spread the result into
 * `configure()`.
 */
export function fromEnv(env = process.env) {
    const settings = {};
    const level = env.LOG_LEVEL?.trim().toLowerCase();
    if (level !== undefined && level !== '') {
        if (!isLevelName(level))
            throw invalidLevelError(env.LOG_LEVEL);
        settings.level = level;
    }
    const debug = env.DEBUG?.trim();
    if (debug !== undefined && debug !== '') {
        const include = [];
        const exclude = [];
        for (const pattern of debug.split(/[\s,]+/)) {
            if (pattern === '' || pattern === '-')
                continue;
            if (pattern.startsWith('-'))
                exclude.push(categoryOf(pattern.slice(1)));
            else
                include.push(categoryOf(pattern));
        }
        settings.debug = { include, exclude };
    }
    const noColor = env.NO_COLOR;
    if (noColor !== undefined && noColor !== '')
        settings.colors = false;
    return { env: settings };
}
function isLevelName(value) {
    return Object.hasOwn(Level, value);
}
/** `arki:kv:*` and `arki:kv` both mean the `arki:kv` category and its descendants; `*` is the root. */
function categoryOf(pattern) {
    if (pattern === '*')
        return '';
    if (pattern.endsWith(':*'))
        return pattern.slice(0, -2);
    if (pattern.endsWith('*'))
        return pattern.slice(0, -1);
    return pattern;
}
/** A context store on `AsyncLocalStorage`: `withContext` scopes survive `await`. */
export function asyncContext() {
    const storage = new AsyncLocalStorage();
    return {
        get: () => storage.getStore(),
        run: (fields, fn) => storage.run(fields, fn),
    };
}
//# sourceMappingURL=index.js.map