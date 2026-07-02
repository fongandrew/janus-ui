import { PageLayout } from '~/lib2-site/layout';
import { renderStatic } from '~/lib2-site/render';

function ColorsPage() {
	return (
		<PageLayout current="colors">
			<hgroup>
				<h1>Colors</h1>
				<p>The color system and APCA contrast grid. Filled in by Phase 3.</p>
			</hgroup>
		</PageLayout>
	);
}

export function render() {
	return renderStatic(() => <ColorsPage />);
}
