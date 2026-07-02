import { PageLayout } from '~/lib2-site/layout';
import { renderStatic } from '~/lib2-site/render';

function HomePage() {
	return (
		<PageLayout>
			<hgroup>
				<h1>Janus</h1>
				<p>
					A CSS-first design system: opinionated knobs over granular utilities, semantic
					names, fork-and-copy distribution, modern browsers only.
				</p>
			</hgroup>
			<div class="o-prose">
				<p>
					Janus ships as four pseudo-packages — <code>css/</code> (standalone, no JS),{' '}
					<code>utils/</code> (framework-agnostic helpers), <code>dom/</code> (vanilla-JS
					progressive enhancement), and <code>solid/</code> (thin Solid wrappers). Take
					only the layers you need.
				</p>
			</div>
			<div class="o-grid p-nav-cards">
				<a href="/v2-variables.html" class="c-card o-box">
					<h2>Composition</h2>
					<p>
						The building blocks: <code>--v-*</code> variable knobs, <code>o-*</code>{' '}
						objects, <code>t-*</code> tools, and typography.
					</p>
				</a>
				<a href="/v2-colors.html" class="c-card o-box">
					<h2>Colors</h2>
					<p>
						The color system — tonal variants, surface roles, and the APCA contrast
						grid.
					</p>
				</a>
				<a href="/v2-components.html" class="c-card o-box">
					<h2>Components</h2>
					<p>
						The <code>c-*</code> catalogue: buttons, cards, forms, modals, menus, and
						more.
					</p>
				</a>
			</div>
		</PageLayout>
	);
}

export function render() {
	return renderStatic(() => <HomePage />);
}
