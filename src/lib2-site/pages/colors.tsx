import { Layout } from '../layout';
import { renderPage } from '../render';

/** Colors (Phase 3 fills in the APCA contrast grid; Phase 9 the playground). */
function Colors() {
	return (
		<Layout section="colors" title="Colors">
			<div class="o-prose">
				<p>The color system and APCA contrast grid land in Phase 3.</p>
			</div>
		</Layout>
	);
}

export function render() {
	return renderPage(() => <Colors />);
}
