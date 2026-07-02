/**
 * Shared navigation model for the v2 documentation site.
 *
 * The site lives under `/site/` (v1's demo site keeps the repo-root HTML files
 * during the migration). Three top-level sections only — Composition, Colors,
 * Components — per §19/§20; each section owns its own internal sidebar/ToC.
 */

export const SITE_BASE = '/site';
export const HOME_HREF = `${SITE_BASE}/`;

export interface NavItem {
	readonly label: string;
	readonly href: string;
	/** Matches `section` ids used by pages to highlight the active link. */
	readonly id: string;
}

/** The three top-nav sections, in build order. */
export const TOP_NAV: readonly NavItem[] = [
	{ id: 'composition', label: 'Composition', href: `${SITE_BASE}/composition/variables.html` },
	{ id: 'colors', label: 'Colors', href: `${SITE_BASE}/colors.html` },
	{ id: 'components', label: 'Components', href: `${SITE_BASE}/components.html` },
];

/** Composition section sidebar / ToC. */
export const COMPOSITION_NAV: readonly NavItem[] = [
	{ id: 'variables', label: 'Variables', href: `${SITE_BASE}/composition/variables.html` },
	{ id: 'objects', label: 'Objects', href: `${SITE_BASE}/composition/objects.html` },
	{ id: 'tools', label: 'Tools', href: `${SITE_BASE}/composition/tools.html` },
	{ id: 'typography', label: 'Typography', href: `${SITE_BASE}/composition/typography.html` },
];
