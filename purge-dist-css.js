import { stat, writeFile } from 'fs/promises';
import { PurgeCSS } from 'purgecss';

const purgeCSSResult = await new PurgeCSS().purge({
	content: ['./dist/**/*.js', './dist/**/*.html'],
	css: ['./dist/**/*.css'],
});

await Promise.all([
	...purgeCSSResult.map(async ({ css, file }) => {
		const initialSize = (await stat(file)).size / 1024;

		await writeFile(file, css);

		const postSize = (await stat(file)).size / 1024;
		// eslint-disable-next-line no-console
		console.log(`${file}: ${initialSize} -> ${postSize} KB`);
	}),
]);
