/* Composition → Objects. Stub until Phase 2 fills it in (§20.2.2). */
import { compositionPage, sectionCard } from '~/lib2-site/shell';

export function render(): string {
	const main = `
		<h1>Objects</h1>
		${sectionCard('Objects', 'The o-* structural primitives are documented here in Phase 2.')}`;
	return compositionPage('objects', main);
}
