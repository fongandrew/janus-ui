import { CompositionLayout } from '~/lib2-site/layout';
import { renderStatic } from '~/lib2-site/render';

function ObjectsPage() {
	return (
		<CompositionLayout current="objects">
			<hgroup>
				<h1>Objects</h1>
				<p>The o-* structural primitives. Filled in by Phase 2.</p>
			</hgroup>
		</CompositionLayout>
	);
}

export function render() {
	return renderStatic(() => <ObjectsPage />);
}
