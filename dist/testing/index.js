// @arki/log/testing: a fake that takes over the default logging instance (RFC §11).
import { defaultLogging } from '../core/default.js';
import { formatValue, jsonMembers } from '../core/json.js';
import { INTERNAL } from '../core/logging.js';
/**
 * Takes over the default instance: level `trace`, every category captured,
 * no sink written. `restore()` (or `using`) gives it back. One fake at a time
 * per process; a second one throws `ARKI_LOG_E004`.
 */
export function fakeLog() {
    const records = [];
    const captured = [];
    const release = defaultLogging()[INTERNAL].installFake((record, channels) => {
        records.push(record);
        captured.push({ record, channels });
    });
    const fail = (text) => {
        throw new LogAssertionError(`${text}\n${describeCaptured(captured)}`);
    };
    return {
        records,
        captured,
        assertLogged: match => {
            if (!records.some(record => matches(record, match)))
                fail(`Expected a record matching ${describe(match)}.`);
        },
        assertNotLogged: match => {
            const found = records.find(record => matches(record, match));
            if (found !== undefined)
                fail(`Expected no record matching ${describe(match)}, found: ${line(found)}.`);
        },
        assertSentTo: (channel, match = {}) => {
            if (!captured.some(entry => entry.channels.includes(channel) && matches(entry.record, match))) {
                fail(`Expected a record matching ${describe(match)} sent to channel "${channel}".`);
            }
        },
        restore: release,
        [Symbol.dispose]: release,
    };
}
export class LogAssertionError extends Error {
    constructor(message) {
        super(message);
        this.name = 'LogAssertionError';
    }
}
function matches(record, match) {
    if (match.level !== undefined && record.levelName !== match.level)
        return false;
    if (match.category !== undefined && record.category !== match.category)
        return false;
    if (match.template !== undefined && record.template !== match.template)
        return false;
    if (match.eventName !== undefined && record.eventName !== match.eventName)
        return false;
    if (match.message !== undefined && record.message() !== match.message)
        return false;
    if (match.fields !== undefined) {
        const fields = record.fields;
        for (const key in match.fields) {
            if (!Object.hasOwn(fields, key) || !same(fields[key], match.fields[key]))
                return false;
        }
    }
    return true;
}
function same(a, b) {
    if (Object.is(a, b))
        return true;
    if (a instanceof Date && b instanceof Date)
        return a.getTime() === b.getTime();
    if (a instanceof Error || b instanceof Error)
        return false;
    if (Array.isArray(a) && Array.isArray(b)) {
        const left = a;
        const right = b;
        return left.length === right.length && left.every((item, index) => same(item, right[index]));
    }
    if (isMap(a) && isMap(b)) {
        const keys = Object.keys(a);
        return keys.length === Object.keys(b).length && keys.every(key => Object.hasOwn(b, key) && same(a[key], b[key]));
    }
    return false;
}
function isMap(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date);
}
function describe(match) {
    const parts = [];
    if (match.level !== undefined)
        parts.push(`level=${match.level}`);
    if (match.category !== undefined)
        parts.push(`category=${JSON.stringify(match.category)}`);
    if (match.template !== undefined)
        parts.push(`template=${JSON.stringify(match.template)}`);
    if (match.message !== undefined)
        parts.push(`message=${JSON.stringify(match.message)}`);
    if (match.eventName !== undefined)
        parts.push(`eventName=${JSON.stringify(match.eventName)}`);
    if (match.fields !== undefined)
        parts.push(`fields={${jsonMembers(match.fields)}}`);
    return parts.length === 0 ? '(anything)' : `{ ${parts.join(', ')} }`;
}
function line(record) {
    const fields = jsonMembers(record.fields);
    const error = record.error === undefined ? '' : ` error=${formatValue(record.error)}`;
    return `${record.levelName.toUpperCase()} [${record.category}] ${JSON.stringify(record.template)} → ${JSON.stringify(record.message())}${fields === '' ? '' : ` {${fields}}`}${error}`;
}
function describeCaptured(captured) {
    if (captured.length === 0)
        return 'Captured records: none.';
    const lines = captured.map(({ record, channels }) => `  ${line(record)}${channels.length > 0 ? ` (to ${channels.join(', ')})` : ''}`);
    return `Captured records (${String(captured.length)}):\n${lines.join('\n')}`;
}
//# sourceMappingURL=index.js.map