/**
 * `ca` — attribute composition (§12.2.1). Merges objects of HTML attributes
 * into one object suitable for spreading onto a JSX element or applying to a
 * raw DOM node, with explicit conflict semantics.
 *
 * Default conflict resolution (the configured default instance):
 *   id, role            throw
 *   data-js             concat (space-joined)
 *   data-*              throw
 *   class, aria-labelledby, aria-describedby, style   concat
 *   everything else     throw
 *
 * Producers pin per-attribute behavior with only()/concat()/override()
 * wrappers, irrespective of the defaults. Any wrapper mismatch throws;
 * same-wrapper-same-value is the only no-op case.
 */

export type AttrPolicy = 'throw' | 'concat' | 'override';

type WrapperKind = 'only' | 'concat' | 'override';

const WRAPPED = Symbol('janus-wrapped-attr');

export interface WrappedValue {
	[WRAPPED]: WrapperKind;
	value: string;
}

export type AttrValue = string | number | boolean | undefined | null | WrappedValue;

export type Attrs = Record<string, AttrValue>;

function wrap(kind: WrapperKind, value: string | number | boolean): WrappedValue {
	return { [WRAPPED]: kind, value: String(value) };
}

/** Must be the sole contribution for this attribute (idempotent on equal values). */
export function only(value: string | number | boolean): WrappedValue {
	return wrap('only', value);
}

/** Joins with other concat contributions (and unwrapped strings). */
export function concat(value: string | number | boolean): WrappedValue {
	return wrap('concat', value);
}

/** Wins regardless of source order. Two overrides throw. */
export function override(value: string | number | boolean): WrappedValue {
	return wrap('override', value);
}

function isWrapped(value: unknown): value is WrappedValue {
	return typeof value === 'object' && value !== null && WRAPPED in value;
}

function separatorFor(attr: string): string {
	return attr === 'style' ? '; ' : ' ';
}

interface Contribution {
	kind: WrapperKind | 'plain';
	value: string;
}

export type CombineAttrsConfig = Record<string, AttrPolicy>;

export class CombineAttrs {
	private readonly exact = new Map<string, AttrPolicy>();
	private readonly prefixes: [string, AttrPolicy][] = [];
	private fallback: AttrPolicy = 'throw';

	constructor(config: CombineAttrsConfig) {
		for (const [pattern, policy] of Object.entries(config)) {
			if (pattern === '...') this.fallback = policy;
			else if (pattern.endsWith('*')) this.prefixes.push([pattern.slice(0, -1), policy]);
			else this.exact.set(pattern, policy);
		}
		// Longest prefix wins (data-js beats data-*)
		this.prefixes.sort((a, b) => b[0].length - a[0].length);
	}

	private policyFor(attr: string): AttrPolicy {
		const exact = this.exact.get(attr);
		if (exact) return exact;
		for (const [prefix, policy] of this.prefixes) {
			if (attr.startsWith(prefix)) return policy;
		}
		return this.fallback;
	}

	/** Merge attribute objects. Bound so it can be destructured / re-exported. */
	combine = (...sources: (Attrs | undefined | null)[]): Record<string, string> => {
		const contributions = new Map<string, Contribution[]>();
		for (const source of sources) {
			if (!source) continue;
			for (const [attr, raw] of Object.entries(source)) {
				if (raw === undefined || raw === null) continue;
				const list = contributions.get(attr) ?? [];
				if (isWrapped(raw)) {
					list.push({ kind: raw[WRAPPED], value: raw.value });
				} else {
					list.push({ kind: 'plain', value: String(raw) });
				}
				contributions.set(attr, list);
			}
		}

		const out: Record<string, string> = {};
		for (const [attr, list] of contributions) {
			out[attr] = this.resolve(attr, list);
		}
		return out;
	};

	private resolve(attr: string, list: Contribution[]): string {
		if (list.length === 1) return list[0]!.value;

		const kinds = new Set(list.map((c) => c.kind));

		// only: sole contribution; a duplicate with the same value is a no-op
		if (kinds.has('only')) {
			const first = list[0]!;
			if (
				list.every(
					(c) => (c.kind === 'only' || c.kind === 'plain') && c.value === first.value,
				)
			) {
				return first.value;
			}
			throw new Error(
				`ca: attribute "${attr}" marked only() received conflicting contributions`,
			);
		}

		// override: exactly one wins; two overrides throw
		if (kinds.has('override')) {
			const overrides = list.filter((c) => c.kind === 'override');
			if (overrides.length > 1) {
				throw new Error(`ca: attribute "${attr}" received two override() contributions`);
			}
			if (kinds.has('concat')) {
				throw new Error(`ca: attribute "${attr}" mixes override() with concat()`);
			}
			return overrides[0]!.value;
		}

		// concat: explicit concat joins with other concat + plain contributions
		if (kinds.has('concat')) {
			return list.map((c) => c.value).join(separatorFor(attr));
		}

		// all plain: fall back to the configured policy
		const policy = this.policyFor(attr);
		if (policy === 'concat') return list.map((c) => c.value).join(separatorFor(attr));
		if (policy === 'override') return list[list.length - 1]!.value;
		throw new Error(`ca: attribute "${attr}" written by multiple sources (policy: throw)`);
	}
}

/** The configured default combiner (§12.2.1). */
const defaultCombiner = new CombineAttrs({
	id: 'throw',
	role: 'throw',
	'data-js': 'concat',
	'data-*': 'throw',
	class: 'concat',
	'aria-labelledby': 'concat',
	'aria-describedby': 'concat',
	style: 'concat',
	'...': 'throw',
});

/** Merge attribute objects with the default conflict semantics. */
export const ca = defaultCombiner.combine;

/** Apply a merged attribute object to a raw DOM element. */
export function apply(el: Element, attrs: Record<string, string>): void {
	for (const [attr, value] of Object.entries(attrs)) {
		el.setAttribute(attr, value);
	}
}
