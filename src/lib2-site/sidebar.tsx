import cx from 'classix';

import { COMPOSITION_NAV, type NavItem } from './site-config';

/**
 * A section sidebar / table of contents. Site-only chrome, so it is a `p-`
 * class in the site's own CSS (§4) — not library material.
 */
export function Sidebar(props: { items: readonly NavItem[]; current?: string | undefined; heading: string }) {
	return (
		<nav class="p-doc-toc" aria-label={props.heading}>
			<p class="p-doc-toc__heading">{props.heading}</p>
			<ul class="p-doc-toc__list">
				{props.items.map((item) => (
					<li>
						<a
							class={cx('p-doc-toc__link', props.current === item.id && 'is-active')}
							href={item.href}
							aria-current={props.current === item.id ? 'page' : undefined}
						>
							{item.label}
						</a>
					</li>
				))}
			</ul>
		</nav>
	);
}

/** Convenience wrapper for the Composition section sidebar. */
export function CompositionSidebar(props: { current?: string | undefined }) {
	return <Sidebar heading="Composition" items={COMPOSITION_NAV} current={props.current} />;
}
