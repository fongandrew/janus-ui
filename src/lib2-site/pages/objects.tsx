import { CompositionLayout } from '../layout';
import { renderPage } from '../render';

/** Composition › Objects (Phase 2 fills this in). */
function Objects() {
	return (
		<CompositionLayout current="objects" title="Objects">
			<div class="o-prose">
				<p>The object reference lands in Phase 2.</p>
			</div>
		</CompositionLayout>
	);
}

export function render() {
	return renderPage(() => <Objects />);
}
