import autoprefixer from 'autoprefixer';
import pruneVars from 'postcss-prune-var';
import tailwindCSS from 'tailwindcss';

export default {
	plugins: [tailwindCSS, autoprefixer, pruneVars],
};
