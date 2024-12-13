import autoprefixer from 'autoprefixer';
import tailwindCSS from 'tailwindcss';
import pruneVars from 'postcss-prune-var';

export default {
	plugins: [tailwindCSS, autoprefixer, pruneVars],
};
