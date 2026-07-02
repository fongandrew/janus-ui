import cx from 'classix';

import { HOME_HREF, TOP_NAV } from './site-config';

/**
 * Top navigation shell (SSR, no JS).
 *
 * Exactly three section links plus the site title (links Home) and an
 * (inert until Phase 9) theme-workbench trigger (§21). Three is the ceiling —
 * each section owns its own internal sidebar/ToC.
 */
export function TopNav(props: { current?: string | undefined }) {
	return (
		<header class="o-bar p-site-nav">
			<a class="p-site-nav__brand" href={HOME_HREF}>
				Janus <span class="p-site-nav__brand-mark">v2</span>
			</a>
			<nav class="o-group p-site-nav__links" aria-label="Primary">
				{TOP_NAV.map((item) => (
					<a
						class={cx('p-site-nav__link', props.current === item.id && 'is-active')}
						href={item.href}
						aria-current={props.current === item.id ? 'page' : undefined}
					>
						{item.label}
					</a>
				))}
			</nav>
			{/* Inert until Phase 9 — activated as the theme-workbench drawer trigger (§21). */}
			<button class="c-button c-button--icon p-site-nav__workbench" type="button" disabled aria-label="Theme workbench (coming soon)">
				⚙
			</button>
		</header>
	);
}
