import { PageLayout } from '~/lib2-site/layout';
import { renderStatic } from '~/lib2-site/render';

function ComponentsPage() {
	return (
		<PageLayout current="components">
			<hgroup>
				<h1>Components</h1>
				<p>The c-* component catalogue. Filled in by Phase 3.</p>
			</hgroup>
		</PageLayout>
	);
}

export function render() {
	return renderStatic(() => <ComponentsPage />);
}
