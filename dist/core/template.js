import { formatValue } from './json.js';
const MAX_CACHED_TEMPLATES = 1000;
const cache = new Map();
/** Parses a template once and caches it (bounded: the oldest entry goes when full). */
export function parseTemplate(template) {
    const hit = cache.get(template);
    if (hit !== undefined)
        return hit;
    const parsed = parse(template);
    if (cache.size >= MAX_CACHED_TEMPLATES) {
        const oldest = cache.keys().next();
        if (oldest.done !== true)
            cache.delete(oldest.value);
    }
    cache.set(template, parsed);
    return parsed;
}
/** How many templates are cached. For tests. */
export function cachedTemplateCount() {
    return cache.size;
}
function parse(template) {
    if (!template.includes('{') && !template.includes('}'))
        return [template];
    const parts = [];
    let literal = '';
    let index = 0;
    const length = template.length;
    while (index < length) {
        const char = template[index];
        if (char === '{') {
            if (template[index + 1] === '{') {
                literal += '{';
                index += 2;
                continue;
            }
            const close = template.indexOf('}', index + 1);
            if (close === -1) {
                literal += template.slice(index);
                break;
            }
            const name = template.slice(index + 1, close);
            if (name === '' || name.includes('{')) {
                literal += '{';
                index += 1;
                continue;
            }
            parts.push(literal, name);
            literal = '';
            index = close + 1;
            continue;
        }
        if (char === '}') {
            literal += '}';
            index += template[index + 1] === '}' ? 2 : 1;
            continue;
        }
        literal += char;
        index += 1;
    }
    parts.push(literal);
    return parts;
}
/** The placeholder names a template uses, in order, without repeats. */
export function placeholderNames(template) {
    const parts = parseTemplate(template);
    const names = [];
    for (let index = 1; index < parts.length; index += 2) {
        const name = parts[index];
        if (name !== undefined && !names.includes(name))
            names.push(name);
    }
    return names;
}
/** Renders a template. A placeholder with no value (absent or `undefined`) stays `{name}`. */
export function renderTemplate(template, fields) {
    return renderParsed(parseTemplate(template), fields);
}
/** Renders an already parsed template. */
export function renderParsed(parts, fields) {
    if (parts.length === 1)
        return parts[0] ?? '';
    let out = parts[0] ?? '';
    for (let index = 1; index < parts.length; index += 2) {
        const name = parts[index] ?? '';
        const value = Object.hasOwn(fields, name) ? fields[name] : undefined;
        out += value === undefined ? `{${name}}` : formatValue(value);
        out += parts[index + 1] ?? '';
    }
    return out;
}
//# sourceMappingURL=template.js.map