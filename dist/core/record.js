import { levelNameOf } from './levels.js';
import { parseTemplate, renderParsed } from './template.js';
export const EMPTY_FIELDS = Object.freeze({});
/**
 * The one object a log call allocates. Fields stay in their layers (shared,
 * bound, scoped, call) and are merged only when something reads `fields`, so
 * a JSON sink can write the bound layer from its cached JSON instead.
 */
export class LogEntry {
    time;
    level;
    levelName;
    category;
    template;
    eventName;
    body;
    error;
    traceId;
    spanId;
    traceFlags;
    resource;
    /** The `withContext` scope this record was logged in; `fingersCrossed` keys its rings on it. */
    scope;
    /** Layers in precedence order (later wins). `undefined` when built by `updateRecord`. */
    shared;
    bound;
    call;
    /** True when built by a log call: the fields are still in their layers and no processor replaced them. */
    layered;
    merged;
    rendered;
    constructor(time, level, category, template, shared, bound, scope, call, error, trace, resource, eventName, body, merged) {
        this.time = time;
        this.level = level;
        this.levelName = levelNameOf(level);
        this.category = category;
        this.template = template;
        this.eventName = eventName;
        this.body = body;
        this.error = error;
        this.traceId = trace?.traceId;
        this.spanId = trace?.spanId;
        this.traceFlags = trace?.traceFlags;
        this.resource = resource;
        this.scope = scope;
        this.shared = merged === undefined ? shared : undefined;
        this.bound = merged === undefined ? bound : undefined;
        this.call = merged === undefined ? call : undefined;
        this.layered = merged === undefined;
        this.merged = merged;
        this.rendered = undefined;
    }
    get fields() {
        if (this.merged === undefined) {
            this.merged = mergeLayers(this.shared, this.bound?.fields, this.scope, this.call);
        }
        return this.merged;
    }
    message() {
        if (this.rendered === undefined) {
            const parts = parseTemplate(this.template);
            // A template without placeholders never touches the fields, so the layers stay unmerged.
            this.rendered = parts.length === 1 ? (parts[0] ?? '') : renderParsed(parts, this.fields);
        }
        return this.rendered;
    }
}
/** Merges field layers; later layers win. Allocates only when two or more layers are present. */
export function mergeLayers(a, b, c, d) {
    let only;
    let count = 0;
    if (a !== undefined) {
        only = a;
        count++;
    }
    if (b !== undefined) {
        only = b;
        count++;
    }
    if (c !== undefined) {
        only = c;
        count++;
    }
    if (d !== undefined) {
        only = d;
        count++;
    }
    if (count === 0 || only === undefined)
        return EMPTY_FIELDS;
    if (count === 1)
        return only;
    const out = {};
    if (a !== undefined)
        assign(out, a);
    if (b !== undefined)
        assign(out, b);
    if (c !== undefined)
        assign(out, c);
    if (d !== undefined)
        assign(out, d);
    return out;
}
function assign(target, source) {
    for (const key in source)
        target[key] = source[key];
}
/**
 * A copy of a record with some parts replaced, for processors. The copy
 * renders its message from its own fields, so a redacted value never reaches
 * `message()`.
 */
export function updateRecord(record, changes) {
    const trace = record.traceId !== undefined && record.spanId !== undefined
        ? { traceId: record.traceId, spanId: record.spanId, traceFlags: record.traceFlags }
        : undefined;
    return new LogEntry(changes.time ?? record.time, changes.level ?? record.level, record.category, changes.template ?? record.template, undefined, undefined, recordScope(record), undefined, 'error' in changes ? changes.error : record.error, trace, record.resource, 'eventName' in changes ? changes.eventName : record.eventName, 'body' in changes ? changes.body : record.body, changes.fields ?? record.fields);
}
/** The `withContext` scope a record was logged in, if the core built it. */
export function recordScope(record) {
    return record instanceof LogEntry ? record.scope : undefined;
}
//# sourceMappingURL=record.js.map