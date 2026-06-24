/* Composition → Tools. Stub until Phase 3 fills it in (§20.2.3). */
import { compositionPage, sectionCard } from '~/lib2-site/shell';

export function render(): string {
	const main = `
		<h1>Tools</h1>
		${sectionCard('Tools', 'The t-* utility classes are documented here in Phase 3.')}`;
	return compositionPage('tools', main);
}
