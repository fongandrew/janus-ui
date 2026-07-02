/**
 * `ca` — attribute composition (§12.2.1). Merges objects of HTML attributes /
 * props into one, with explicit conflict semantics. The canonical way to
 * combine handler-producer output with a consumer's own props.
 */

type WrapperKind = 'only' | 'concat' | 'override';

interface Wrapper {
	readonly __caKind: WrapperKind;
	readonly value: unknown;
}

function isWrapper(x: unknown): x is Wrapper {
	return typeof x === 'object' && x !== null && '__caKind' in x;
}

/** Must be the sole contribution for this attribute (same-value is idempotent). */
export function only<T>(value: T): T {
	return { __caKind: 'only', value } as unknown as T;
}

/** Joins with other `concat` contributions. Throws if combined with only/override. */
export function concat<T>(value: T): T {
	return { __caKind: 'concat', value } as unknown as T;
}

/** Wins regardless of source order. Two overrides throw. */
export function override<T>(value: T): T {
	return { __caKind: 'override', value } as unknown as T;
}

export type ConflictRule = 'throw' | 'concat' | 'override';

export type ConflictMap = Record<string, ConflictRule>;

/** The default rule map (§12.2.1). */
export const DEFAULT_CONFLICT_MAP: ConflictMap = {
	'id': 'throw',
	'role': 'throw',
	'data-js': 'concat',
	'data-*': 'throw',
	'class': 'concat',
	'aria-labelledby': 'concat',
	'aria-describedby': 'concat',
	'style': 'concat',
	'...': 'throw',
};

function joinSeparator(key: string): string {
	return key === 'style' ? '; ' : ' ';
}

export class CombineAttrs {
	constructor(private readonly rules: ConflictMap = DEFAULT_CONFLICT_MAP) {}

	private ruleFor(key: string): ConflictRule {
		if (key in this.rules) return this.rules[key]!;
		if (key.startsWith('data-') && this.rules['data-*']) return this.rules['data-*'];
		return this.rules['...'] ?? 'throw';
	}

	private defaultKind(key: string): WrapperKind | 'throw' {
		const rule = this.ruleFor(key);
		return rule; // 'concat' | 'override' | 'throw'
	}

	combine(...sources: (Record<string, unknown> | null | undefined)[]): Record<string, unknown> {
		const contributions = new Map<string, unknown[]>();
		for (const src of sources) {
			if (!src) continue;
			for (const [key, value] of Object.entries(src)) {
				if (value === undefined) continue;
				const list = contributions.get(key);
				if (list) list.push(value);
				else contributions.set(key, [value]);
			}
		}

		const out: Record<string, unknown> = {};
		for (const [key, values] of contributions) {
			out[key] = this.resolve(key, values);
		}
		return out;
	}

	private resolve(key: string, values: unknown[]): unknown {
		if (values.length === 1 && !isWrapper(values[0])) return values[0];

		const items = values.map((v) =>
			isWrapper(v)
				? { kind: v.__caKind as WrapperKind | 'throw', value: v.value }
				: { kind: this.defaultKind(key), value: v },
		);

		const onlys = items.filter((i) => i.kind === 'only');
		if (onlys.length) {
			if (items.some((i) => i.kind !== 'only')) {
				throw new Error(`ca: attribute "${key}" mixes only() with other contributions`);
			}
			const first = onlys[0]!.value;
			if (onlys.some((i) => i.value !== first)) {
				throw new Error(`ca: attribute "${key}" has conflicting only() values`);
			}
			return first;
		}

		const overrides = items.filter((i) => i.kind === 'override');
		if (overrides.length) {
			if (overrides.length > 1) {
				throw new Error(`ca: attribute "${key}" has multiple override() contributions`);
			}
			return overrides[0]!.value;
		}

		if (items.every((i) => i.kind === 'concat')) {
			const parts = items
				.map((i) => i.value)
				.filter((v) => v !== undefined && v !== null && v !== '')
				.map(String);
			return parts.join(joinSeparator(key));
		}

		throw new Error(`ca: attribute "${key}" has conflicting values (rule: throw)`);
	}
}

const defaultCombiner = new CombineAttrs();

/** Merge attribute/prop objects with the default conflict rules. */
export function ca(
	...sources: (Record<string, unknown> | null | undefined)[]
): Record<string, unknown> {
	return defaultCombiner.combine(...sources);
}

/** Apply a merged attribute object to a raw DOM element. */
export function apply(el: Element, attrs: Record<string, unknown>): void {
	for (const [key, value] of Object.entries(attrs)) {
		if (value === undefined || value === null || value === false) continue;
		if (value === true) {
			el.setAttribute(key, '');
		} else {
			el.setAttribute(key, String(value));
		}
	}
}
