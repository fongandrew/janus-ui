import { CompositionLayout } from '../layout';
import { renderPage } from '../render';

/** Composition › Tools (Phase 3 fills this in). */
function Tools() {
	return (
		<CompositionLayout current="tools" title="Tools">
			<div class="o-prose">
				<p>The tools reference lands in Phase 3.</p>
			</div>
		</CompositionLayout>
	);
}

export function render() {
	return renderPage(() => <Tools />);
}
