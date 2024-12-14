import { stat, writeFile } from 'fs/promises';
import { PurgeCSS } from 'purgecss';

const purgeCSSResult = await new PurgeCSS().purge({
	content: ['./dist/**/*.js', './dist/**/*.html'],
	css: ['./dist/**/*.css'],
	variables: true,
});

await Promise.all([
	...purgeCSSResult.map(async ({ css, file }) => {
		const initialSize = (await stat(file)).size / 1024;

		await writeFile(file, css);

		const postSize = (await stat(file)).size / 1024;
		console.log(`${file}: ${initialSize} -> ${postSize} KB`);
	}),
]);
