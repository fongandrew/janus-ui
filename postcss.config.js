import tailwindCSS from '@tailwindcss/postcss';
import pruneVars from 'postcss-prune-var';

export default {
	plugins: [tailwindCSS, pruneVars],
};
