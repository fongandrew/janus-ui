import { createSignal, type JSX } from 'solid-js';

import { ComponentsPage } from '~/demos/pages/components';
import { HomePage } from '~/demos/pages/home';
import { TypographyPage } from '~/demos/pages/typography';

type Page = 'home' | 'components' | 'typography';

export function App(): JSX.Element {
	const [page, setPage] = createSignal<Page>('home');

	return (
		<div class="o-stack">
			<nav class="o-container">
				<div class="o-row" style={{ 'align-items': 'center' }}>
					<strong style={{ 'font-size': 'var(--v-font-size-h3)' }}>Janus UI</strong>
					<div class="o-group">
						<button
							class={`c-button o-input-box ${page() === 'home' ? 'v-colors-primary' : ''}`}
							onClick={() => setPage('home')}
						>
							Home
						</button>
						<button
							class={`c-button o-input-box ${page() === 'components' ? 'v-colors-primary' : ''}`}
							onClick={() => setPage('components')}
						>
							Components
						</button>
						<button
							class={`c-button o-input-box ${page() === 'typography' ? 'v-colors-primary' : ''}`}
							onClick={() => setPage('typography')}
						>
							Typography
						</button>
					</div>
				</div>
			</nav>
			<main class="o-container o-stack">
				{page() === 'home' && <HomePage />}
				{page() === 'components' && <ComponentsPage />}
				{page() === 'typography' && <TypographyPage />}
			</main>
		</div>
	);
}
