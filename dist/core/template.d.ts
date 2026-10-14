import type { FieldInput, Fields, Value } from './types.js';
/**
 * The placeholder names in a literal template. `{{` is a literal brace; `{}` and
 * a name that contains `{` are not placeholders. Tail-recursive, so long
 * templates do not hit the instantiation-depth limit. Mirrors `parseTemplate`.
 */
export type PlaceholderNames<T extends string, Acc extends string = never> = T extends `${string}{${infer Rest}` ? Rest extends `{${infer After}` ? PlaceholderNames<After, Acc> : Rest extends `${infer Name}}${infer After}` ? Name extends '' | `${string}{${string}` ? PlaceholderNames<Rest, Acc> : PlaceholderNames<After, Acc | Name> : Acc : Acc;
type PlaceholderFields<K extends string> = Readonly<Record<K, Value>> & Fields;
/**
 * The fields argument of a log call. A placeholder must be satisfied by the
 * call's fields or by fields already bound with `.with()` (the `Bound` keys).
 * A template typed as plain `string` accepts any fields.
 */
export type FieldsArg<T extends string, Bound extends string> = string extends T ? [fields?: FieldInput] : [Exclude<PlaceholderNames<T>, Bound>] extends [never] ? [fields?: FieldInput] : [
    fields: PlaceholderFields<Exclude<PlaceholderNames<T>, Bound>> | (() => PlaceholderFields<Exclude<PlaceholderNames<T>, Bound>>)
];
/** Parsed template: even indexes are literal text, odd indexes are placeholder names. */
export type ParsedTemplate = readonly string[];
/** Parses a template once and caches it (bounded: the oldest entry goes when full). */
export declare function parseTemplate(template: string): ParsedTemplate;
/** How many templates are cached. For tests. */
export declare function cachedTemplateCount(): number;
/** The placeholder names a template uses, in order, without repeats. */
export declare function placeholderNames(template: string): readonly string[];
/** Renders a template. A placeholder with no value (absent or `undefined`) stays `{name}`. */
export declare function renderTemplate(template: string, fields: Fields): string;
/** Renders an already parsed template. */
export declare function renderParsed(parts: ParsedTemplate, fields: Fields): string;
export {};
//# sourceMappingURL=template.d.ts.map