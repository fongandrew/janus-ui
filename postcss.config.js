import autoprefixer from 'autoprefixer';
import mixins from 'postcss-mixins';
import vars from 'postcss-simple-vars';
import tailwindCSS from 'tailwindcss';

export default {
	plugins: [mixins, vars, tailwindCSS, autoprefixer],
};
