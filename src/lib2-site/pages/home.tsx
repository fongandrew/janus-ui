import { Card, CardDescription, CardTitle } from '~/lib2/solid/card';

import { Layout } from '../layout';
import { renderPage } from '../render';
import { TOP_NAV } from '../site-config';

/**
 * Home page (placeholder — §0.5 step 3).
 *
 * Enough to prove the shell renders and deploys: a headline, one paragraph,
 * and nav cards that fill in as pages land. Full Home content is finished in
 * Phase 9 (§20.1).
 */
function Home() {
	return (
		<Layout section="home" title="Janus UI v2">
			<div class="o-prose p-doc-section">
				<p>
					A CSS-first component system. The library is a CSS package; JS is a strictly
					optional second layer. This site <em>is</em> the documentation — every page here
					is authored in Solid JSX and rendered to static HTML at build time.
				</p>
			</div>

			<div class="o-grid p-doc-nav-cards">
				{TOP_NAV.map((item) => (
					<a href={item.href} class="p-doc-nav-card-link">
						<Card>
							<CardTitle>{item.label}</CardTitle>
							<CardDescription>Explore the {item.label.toLowerCase()} reference.</CardDescription>
						</Card>
					</a>
				))}
			</div>
		</Layout>
	);
}

export function render() {
	return renderPage(() => <Home />);
}
