import { CompositionLayout } from '~/lib2-site/layout';
import { renderStatic } from '~/lib2-site/render';

function ToolsPage() {
	return (
		<CompositionLayout current="tools">
			<hgroup>
				<h1>Tools</h1>
				<p>The narrow t-* utility layer. Filled in by Phase 3.</p>
			</hgroup>
		</CompositionLayout>
	);
}

export function render() {
	return renderStatic(() => <ToolsPage />);
}
