import autoprefixer from 'autoprefixer';
import mixins from 'postcss-mixins';
import tailwindCSS from 'tailwindcss';

export default {
	plugins: [mixins, tailwindCSS, autoprefixer],
};
