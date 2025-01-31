import autoprefixer from 'autoprefixer';
import mixins from 'postcss-mixins';
import vars from 'postcss-simple-vars';

export default {
	plugins: [mixins, vars, autoprefixer],
};
