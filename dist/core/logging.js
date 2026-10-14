import { alreadyConfiguredError, fakeActiveError, staleHandleError, unknownChannelError } from './errors.js';
import { Level, toLevel } from './levels.js';
import { deliver, syncContext } from './pipeline.js';
import { EMPTY_FIELDS, LogEntry } from './record.js';
import { reportFailure } from './report.js';
// ---------------------------------------------------------------------------
// Internals shared with @arki/log/testing
// ---------------------------------------------------------------------------
/** Key of the internal API; `Symbol.for` so two copies of the package share it. */
export const INTERNAL = Symbol.for('@arki/log/internal@1');
export function isInternalLogging(value) {
    return typeof value === 'object' && value !== null && INTERNAL in value && 'getLogger' in value;
}
/** Records at `warn` and up before `configure()` are kept here (RFC §8.3). */
const PRE_CONFIGURE_RING = 64;
const NO_PROCESSORS = [];
function parentOf(category) {
    const index = category.lastIndexOf(':');
    return index === -1 ? '' : category.slice(0, index);
}
class LoggingImpl {
    /** Goes up on every configure, reconfigure, close and fake install (RFC §8.2). */
    version = 0;
    processors = NO_PROCESSORS;
    resource = EMPTY_FIELDS;
    traceSource;
    shared;
    context = syncContext();
    state;
    fake;
    ring = [];
    ringRoute;
    loggers = new Map();
    routes = new Map();
    [INTERNAL] = {
        installFake: capture => {
            if (this.fake !== undefined)
                throw fakeActiveError();
            this.fake = capture;
            this.bump();
            return () => {
                if (this.fake !== capture)
                    return;
                this.fake = undefined;
                this.bump();
            };
        },
    };
    constructor() {
        const ringSink = {
            write: record => {
                this.ring.push(record);
                if (this.ring.length > PRE_CONFIGURE_RING)
                    this.ring.shift();
            },
        };
        this.ringRoute = { min: Level.warn, entries: [{ sink: ringSink, min: Level.warn }] };
    }
    getLogger(category = '') {
        return this.loggerFor(category);
    }
    /** The memoised plain logger for a category. */
    loggerFor(category) {
        let logger = this.loggers.get(category);
        if (logger === undefined) {
            logger = new LoggerImpl(this, category, undefined, undefined, undefined);
            this.loggers.set(category, logger);
        }
        return logger;
    }
    configure(config) {
        if (this.fake !== undefined)
            throw fakeActiveError();
        if (this.state !== undefined)
            throw alreadyConfiguredError();
        this.install(config);
        // A handle acts only on the configuration it created. In dev, Vite can
        // close an old module's handle after the reloaded module has configured
        // again; that late close must not shut the new setup down.
        let owned = this.state;
        return {
            flush: () => this.flush(),
            close: options => (this.state === owned ? this.close(options?.timeoutMs) : Promise.resolve()),
            reconfigure: next => {
                if (this.state !== owned)
                    return Promise.reject(staleHandleError());
                const retired = this.install(next);
                owned = this.state;
                return drainAndClose(retired);
            },
        };
    }
    withContext(fields, fn) {
        const outer = this.context.get();
        const scope = {};
        if (outer !== undefined)
            for (const key in outer)
                scope[key] = outer[key];
        for (const key in fields)
            scope[key] = fields[key];
        return this.context.run(scope, fn);
    }
    shareContext(fields) {
        const next = {};
        if (this.shared !== undefined)
            for (const key in this.shared)
                next[key] = this.shared[key];
        for (const key in fields)
            next[key] = fields[key];
        this.shared = next;
    }
    /** The route for a category (and an optional `to()` override), cached per version. */
    route(category, to) {
        const key = to === undefined ? category : `${category}\u0000${to.join('\u0000')}`;
        let route = this.routes.get(key);
        if (route === undefined) {
            route = this.resolve(category, to);
            this.routes.set(key, route);
        }
        return route;
    }
    /** Builds one record and sends it down the route (RFC §7). Called only after the level check passed. */
    write(logger, level, template, input, explicitError, eventName, body) {
        let call;
        if (typeof input === 'function') {
            try {
                call = input();
            }
            catch (error) {
                call = { 'log.thunk_error': error instanceof Error ? error : String(error) };
            }
        }
        else {
            call = input;
        }
        let error = explicitError;
        if (call !== undefined) {
            const errorKey = call.error instanceof Error
                ? 'error'
                : call.err instanceof Error
                    ? 'err'
                    : call.cause instanceof Error
                        ? 'cause'
                        : undefined;
            if (errorKey !== undefined) {
                const found = call[errorKey];
                if (error === undefined && found instanceof Error)
                    error = found;
                call = without(call, errorKey);
            }
        }
        const entry = new LogEntry(Date.now(), level, logger.category, template, this.shared, logger.bound, this.context.get(), call, error, logger.traceContext ?? this.traceSource?.(), this.resource, eventName, body, undefined);
        this.dispatch(entry, logger.entries);
    }
    dispatch(record, entries) {
        let current = record;
        const processors = this.processors;
        for (const processor of processors) {
            try {
                current = processor(current);
            }
            catch (error) {
                // Drop the record: the failing processor may be the redactor.
                reportFailure(processor, 'a processor', error);
                return;
            }
            if (current === null)
                return;
        }
        for (const entry of entries) {
            if (current.level >= entry.min)
                deliver(entry.sink, current);
        }
    }
    bump() {
        this.version++;
        this.routes = new Map();
    }
    resolve(category, to) {
        const state = this.state;
        const fake = this.fake;
        if (fake !== undefined) {
            const channels = to ?? (state === undefined ? [] : channelsFor(state, category));
            const sink = { write: record => fake(record, channels) };
            return { min: Level.trace, entries: [{ sink, min: Level.trace }] };
        }
        if (state === undefined)
            return this.ringRoute;
        const level = levelFor(state, category);
        const names = to ?? channelsFor(state, category);
        const entries = [];
        let min = Number.POSITIVE_INFINITY;
        for (const name of names) {
            const sink = state.channels.get(name);
            if (sink === undefined)
                throw unknownChannelError(name, [...state.channels.keys()]);
            if (entries.some(entry => entry.sink === sink))
                continue;
            const entryMin = sink.captureFrom === undefined
                ? Math.max(level, sink.level === undefined ? 0 : Level[sink.level])
                : Level[sink.captureFrom];
            entries.push({ sink, min: entryMin });
            if (entryMin < min)
                min = entryMin;
        }
        return { min, entries };
    }
    /** Swaps in a configuration. Returns the old sinks the new one does not reuse, for the caller to drain. */
    install(config) {
        const next = buildState(config);
        const previous = this.state;
        this.state = next;
        this.processors = next.processors;
        this.resource = next.resource;
        this.traceSource = next.trace;
        if (config.context !== undefined)
            this.context = config.context;
        this.bump();
        if (previous === undefined) {
            const replay = this.ring;
            this.ring = [];
            for (const record of replay) {
                const route = this.route(record.category);
                if (record.level >= route.min)
                    this.dispatch(record, route.entries);
            }
            return [];
        }
        const kept = new Set(next.channels.values());
        return uniqueSinks(previous).filter(sink => !kept.has(sink));
    }
    async flush() {
        const state = this.state;
        if (state === undefined)
            return;
        await Promise.all(uniqueSinks(state).map(async (sink) => sink.flush?.()));
    }
    async close(timeoutMs) {
        const state = this.state;
        if (state === undefined)
            return;
        this.state = undefined;
        this.processors = NO_PROCESSORS;
        this.resource = EMPTY_FIELDS;
        this.traceSource = undefined;
        this.bump();
        const work = drainAndClose(uniqueSinks(state));
        if (timeoutMs === undefined)
            return work;
        let timer;
        const timeout = new Promise(resolve => {
            timer = setTimeout(resolve, timeoutMs);
        });
        try {
            await Promise.race([work, timeout]);
        }
        finally {
            clearTimeout(timer);
        }
    }
}
function uniqueSinks(state) {
    return [...new Set(state.channels.values())];
}
async function drainAndClose(sinks) {
    await Promise.all(sinks.map(async (sink) => sink.flush?.()));
    await Promise.all(sinks.map(async (sink) => sink.close?.()));
}
function without(fields, omit) {
    const out = {};
    for (const key in fields)
        if (key !== omit)
            out[key] = fields[key];
    return out;
}
function buildState(config) {
    const channels = new Map(Object.entries(config.channels));
    const known = [...channels.keys()];
    const check = (names) => {
        if (names === undefined)
            return;
        for (const name of names)
            if (!channels.has(name))
                throw unknownChannelError(name, known);
    };
    const env = config.env;
    const rootLevel = env?.level ?? config.default.level;
    toLevel(rootLevel);
    check(config.default.channels);
    const rules = new Map([['', { level: rootLevel, channels: config.default.channels }]]);
    if (config.categories !== undefined) {
        for (const [category, rule] of Object.entries(config.categories)) {
            if (rule.level !== undefined)
                toLevel(rule.level);
            check(rule.channels);
            if (category !== '')
                rules.set(category, rule);
        }
    }
    return {
        channels,
        rules,
        processors: config.processors ?? NO_PROCESSORS,
        resource: config.resource ?? EMPTY_FIELDS,
        trace: config.trace,
        debugInclude: new Set(env?.debug?.include),
        debugExclude: new Set(env?.debug?.exclude),
    };
}
/** Nearest configured ancestor's level, lowered to `debug` by a `DEBUG` match that no `-` exclusion beats. */
function levelFor(state, category) {
    let level = Level.info;
    for (let name = category;; name = parentOf(name)) {
        const rule = state.rules.get(name);
        if (rule?.level !== undefined) {
            level = Level[rule.level];
            break;
        }
        if (name === '')
            break;
    }
    if (state.debugInclude.size === 0)
        return level;
    for (let name = category;; name = parentOf(name)) {
        if (state.debugExclude.has(name))
            return level;
        if (state.debugInclude.has(name))
            return Math.min(level, Level.debug);
        if (name === '')
            return level;
    }
}
/** Nearest configured ancestor's channels. A rule replaces, it does not add; `inherit: false` stops the walk. */
function channelsFor(state, category) {
    for (let name = category;; name = parentOf(name)) {
        const rule = state.rules.get(name);
        if (rule?.channels !== undefined)
            return rule.channels;
        if (rule?.inherit === false || name === '')
            return [];
    }
}
class LoggerImpl {
    category;
    logging;
    bound;
    traceContext;
    channels;
    /** Late-binding cache (RFC §8.2). */
    version = -1;
    min = Number.POSITIVE_INFINITY;
    entries = [];
    constructor(logging, category, bound, traceContext, channels) {
        this.logging = logging;
        this.category = category;
        this.bound = bound;
        this.traceContext = traceContext;
        this.channels = channels;
    }
    refresh() {
        const route = this.logging.route(this.category, this.channels);
        this.version = this.logging.version;
        this.min = route.min;
        this.entries = route.entries;
    }
    trace(template, fields) {
        if (this.version !== this.logging.version)
            this.refresh();
        if (this.min > 1)
            return;
        this.logging.write(this, 1, template, fields);
    }
    debug(template, fields) {
        if (this.version !== this.logging.version)
            this.refresh();
        if (this.min > 5)
            return;
        this.logging.write(this, 5, template, fields);
    }
    info(template, fields) {
        if (this.version !== this.logging.version)
            this.refresh();
        if (this.min > 9)
            return;
        this.logging.write(this, 9, template, fields);
    }
    warn(template, fields) {
        if (this.version !== this.logging.version)
            this.refresh();
        if (this.min > 13)
            return;
        this.logging.write(this, 13, template, fields);
    }
    error(template, fields) {
        if (this.version !== this.logging.version)
            this.refresh();
        if (this.min > 17)
            return;
        if (typeof template === 'string')
            this.logging.write(this, 17, template, fields);
        else
            this.logging.write(this, 17, template.message, fields, template);
    }
    fatal(template, fields) {
        if (this.version !== this.logging.version)
            this.refresh();
        if (this.min > 21)
            return;
        if (typeof template === 'string')
            this.logging.write(this, 21, template, fields);
        else
            this.logging.write(this, 21, template.message, fields, template);
    }
    log(level, template, fields) {
        const severity = toLevel(level);
        if (this.version !== this.logging.version)
            this.refresh();
        if (this.min > severity)
            return;
        this.logging.write(this, severity, template, fields);
    }
    isEnabled(level) {
        const severity = toLevel(level);
        if (this.version !== this.logging.version)
            this.refresh();
        return severity >= this.min;
    }
    emit(event) {
        const severity = toLevel(event.level);
        if (this.version !== this.logging.version)
            this.refresh();
        if (this.min > severity)
            return;
        this.logging.write(this, severity, '', event.fields, undefined, event.eventName, event.body);
    }
    with(fields) {
        const merged = {};
        const previous = this.bound?.fields;
        if (previous !== undefined)
            for (const key in previous)
                merged[key] = previous[key];
        for (const key in fields)
            merged[key] = fields[key];
        return new LoggerImpl(this.logging, this.category, { fields: merged, json: undefined }, this.traceContext, this.channels);
    }
    child(name) {
        const category = this.category === '' ? name : `${this.category}:${name}`;
        if (this.bound === undefined && this.traceContext === undefined && this.channels === undefined) {
            return this.logging.loggerFor(category);
        }
        return new LoggerImpl(this.logging, category, this.bound, this.traceContext, this.channels);
    }
    withTrace(trace) {
        return new LoggerImpl(this.logging, this.category, this.bound, trace, this.channels);
    }
    to(...channels) {
        return new LoggerImpl(this.logging, this.category, this.bound, this.traceContext, channels);
    }
}
/** A private logging instance with the same functions as the default one (RFC §8.1). */
export function createLogging() {
    return new LoggingImpl();
}
/** For the default instance: same as `createLogging`, typed with the internal API. */
export function createInternalLogging() {
    return new LoggingImpl();
}
//# sourceMappingURL=logging.js.map