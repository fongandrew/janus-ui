import { Layout } from '../layout';
import { renderPage } from '../render';

/** Components (Phase 3 fills in the static CSS gallery; Phase 9 interactivity). */
function Components() {
	return (
		<Layout section="components" title="Components">
			<div class="o-prose">
				<p>The component gallery lands in Phase 3.</p>
			</div>
		</Layout>
	);
}

export function render() {
	return renderPage(() => <Components />);
}
