import { For, type JSX } from 'solid-js';

export interface TokenRow {
	/** Custom property name, e.g. --v-spacing */
	name: string;
	/** The authored default */
	default: string;
	/** One-line description */
	description: string;
	/** For derived tokens: the source knob / formula */
	derivedFrom?: string;
	/** Primary knobs are the documented public surface */
	primary?: boolean;
}

/**
 * Reference table for a token group (§20.2.1): knob name, default, one-line
 * description, and derivation source. Primary knobs are visually
 * distinguished from secondary/derived tokens.
 */
export function TokenTable(props: { rows: TokenRow[] }) {
	return (
		<table class="p-token-table">
			<thead>
				<tr>
					<th>Knob</th>
					<th>Default</th>
					<th>Description</th>
					<th>Derives from</th>
				</tr>
			</thead>
			<tbody>
				<For each={props.rows}>
					{(row) => (
						<tr class={row.primary ? 'p-token-table__primary' : undefined}>
							<td>
								<code>{row.name}</code>
								{row.primary ? (
									<span class="p-token-table__badge">primary</span>
								) : null}
							</td>
							<td>
								<code>{row.default}</code>
							</td>
							<td>{row.description}</td>
							<td>{row.derivedFrom ? <code>{row.derivedFrom}</code> : '—'}</td>
						</tr>
					)}
				</For>
			</tbody>
		</table>
	);
}

/** Section wrapper for a doc page: anchored heading + content. */
export function DocSection(props: { id: string; title: string; children: JSX.Element }) {
	return (
		<section id={props.id} class="p-doc-section">
			<h2>{props.title}</h2>
			{props.children}
		</section>
	);
}
