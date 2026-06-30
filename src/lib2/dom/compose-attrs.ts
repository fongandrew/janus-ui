/**
 * `ca` — attribute composition (design spec §12.2.1).
 *
 * `ca(...sources)` merges objects of HTML attributes into one object
 * suitable for spreading onto a JSX element or applying to a raw DOM node.
 * Conflicting contributions for the same key are resolved by a per-key
 * default rule (`'throw'` or `'concat'`), or — when a producer wraps its
 * value with `only()` / `concat()` / `override()` — by that wrapper's own
 * semantics, irrespective of the default.
 */

export type AttrPrimitive = string | number | boolean;

export type WrapKind = 'only' | 'concat' | 'override';

export interface Wrapped {
	readonly __ca: WrapKind;
	readonly value: AttrPrimitive;
}

export type AttrValue = AttrPrimitive | Wrapped | undefined;

export type AttrSource = Record<string, AttrValue> | null | undefined | false;

function wrap(kind: WrapKind, value: AttrPrimitive): Wrapped {
	return { __ca: kind, value };
}

/** Declares this value must be the attribute's sole contribution. A repeat with the same value is a no-op; anything else throws. */
export function only(value: AttrPrimitive): Wrapped {
	return wrap('only', value);
}

/** Declares this value joins with other `concat` contributions for the same attribute. */
export function concat(value: AttrPrimitive): Wrapped {
	return wrap('concat', value);
}

/** Declares this value wins over any plain (unwrapped) contribution for the same attribute, regardless of source order. */
export function override(value: AttrPrimitive): Wrapped {
	return wrap('override', value);
}

function isWrapped(value: AttrValue): value is Wrapped {
	return typeof value === 'object' && value !== null && '__ca' in value;
}

/** Per-key default conflict rule. `'...'` is the catch-all; `'<prefix>*'` keys are wildcard prefix matches (e.g. `'data-*'`). */
export type AttrRules = Record<string, 'throw' | 'concat'> & { '...': 'throw' | 'concat' };

const SEMICOLON_JOINED = new Set(['style']);

function joinChar(key: string): string {
	return SEMICOLON_JOINED.has(key) ? '; ' : ' ';
}

function resolveDefaultRule(rules: AttrRules, key: string): 'throw' | 'concat' {
	if (key in rules) {
		return rules[key]!;
	}
	let best: { prefix: string; rule: 'throw' | 'concat' } | undefined;
	for (const candidate of Object.keys(rules)) {
		if (candidate === '...' || !candidate.endsWith('*')) {
			continue;
		}
		const prefix = candidate.slice(0, -1);
		if (key.startsWith(prefix) && (!best || prefix.length > best.prefix.length)) {
			best = { prefix, rule: rules[candidate]! };
		}
	}
	return best ? best.rule : rules['...'];
}

interface Contribution {
	value: AttrPrimitive;
	/** Set when this contribution came from an explicit only()/concat()/override() wrapper. */
	wrapKind?: WrapKind;
}

function mergeKey(key: string, rules: AttrRules, contributions: Contribution[]): AttrPrimitive {
	if (contributions.length === 1) {
		return contributions[0]!.value;
	}

	const overrides = contributions.filter((c) => c.wrapKind === 'override');
	const concats = contributions.filter((c) => c.wrapKind === 'concat');
	const onlys = contributions.filter((c) => c.wrapKind === 'only');
	const plain = contributions.filter((c) => c.wrapKind === undefined);

	const explicitKinds = new Set(
		[...overrides, ...concats, ...onlys].map((c) => c.wrapKind as WrapKind),
	);
	if (explicitKinds.size > 1) {
		throw new Error(`ca: mismatched wrapper types for "${key}"`);
	}

	if (overrides.length > 0) {
		if (overrides.length > 1) {
			throw new Error(`ca: multiple override() contributions for "${key}"`);
		}
		// override wins regardless of source order, even over plain contributions.
		return overrides[0]!.value;
	}

	if (onlys.length > 0) {
		const all = [...onlys, ...plain];
		const first = all[0]!.value;
		if (all.some((c) => c.value !== first)) {
			throw new Error(`ca: conflicting values for "${key}" (only() requires a single value)`);
		}
		return first;
	}

	if (concats.length > 0) {
		// An explicit concat() pins the mode for the key; plain contributions join in too.
		return [...concats, ...plain].map((c) => String(c.value)).join(joinChar(key));
	}

	// No explicit wrappers at all -- fall back to the table's default rule.
	const rule = resolveDefaultRule(rules, key);
	if (rule === 'concat') {
		return plain.map((c) => String(c.value)).join(joinChar(key));
	}
	throw new Error(`ca: conflicting contributions for "${key}" (default rule is "throw")`);
}

/**
 * Construct a `ca`-like combiner with a custom default-rule map. Most
 * consumers never need this — `~/lib2/dom/compose-attrs`'s exported `ca` is
 * the configured default.
 */
export class CombineAttrs {
	private rules: AttrRules;

	constructor(rules: AttrRules) {
		this.rules = rules;
	}

	combine = (...sources: AttrSource[]): Record<string, AttrPrimitive> => {
		const byKey = new Map<string, Contribution[]>();
		for (const source of sources) {
			if (!source) {
				continue;
			}
			for (const [key, raw] of Object.entries(source)) {
				if (raw === undefined) {
					continue;
				}
				const list = byKey.get(key) ?? [];
				if (isWrapped(raw)) {
					list.push({ value: raw.value, wrapKind: raw.__ca });
				} else {
					list.push({ value: raw });
				}
				byKey.set(key, list);
			}
		}

		const result: Record<string, AttrPrimitive> = {};
		for (const [key, contributions] of byKey) {
			result[key] = mergeKey(key, this.rules, contributions);
		}
		return result;
	};
}

const DEFAULT_RULES: AttrRules = {
	id: 'throw',
	role: 'throw',
	'data-js': 'concat',
	'data-*': 'throw',
	class: 'concat',
	'aria-labelledby': 'concat',
	'aria-describedby': 'concat',
	style: 'concat',
	'...': 'throw',
};

/** The library's configured attribute combiner. `ca(...sources)` merges attribute objects with the default conflict rules (§12.2.1). */
export const ca = new CombineAttrs(DEFAULT_RULES).combine;

/**
 * Apply a `ca`-style attribute object to a raw DOM node — the non-JSX
 * sibling to spreading the result of `ca(...)` onto a JSX element.
 */
export function apply(el: Element, attrs: Record<string, AttrPrimitive>): void {
	for (const [key, value] of Object.entries(attrs)) {
		if (value === false) {
			el.removeAttribute(key);
		} else if (value === true) {
			el.setAttribute(key, '');
		} else {
			el.setAttribute(key, String(value));
		}
	}
}
