import { CompositionLayout } from '~/lib2-site/layout';
import { renderStatic } from '~/lib2-site/render';

function VariablesPage() {
	return (
		<CompositionLayout current="variables">
			<hgroup>
				<h1>Variables</h1>
				<p>The public --v-* knob surface. Filled in by Phase 1.</p>
			</hgroup>
		</CompositionLayout>
	);
}

export function render() {
	return renderStatic(() => <VariablesPage />);
}
