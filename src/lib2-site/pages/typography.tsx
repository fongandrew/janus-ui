import { CompositionLayout } from '~/lib2-site/layout';
import { renderStatic } from '~/lib2-site/render';

function TypographyPage() {
	return (
		<CompositionLayout current="typography">
			<hgroup>
				<h1>Typography</h1>
				<p>The type system. Filled in by Phase 1.</p>
			</hgroup>
		</CompositionLayout>
	);
}

export function render() {
	return renderStatic(() => <TypographyPage />);
}
