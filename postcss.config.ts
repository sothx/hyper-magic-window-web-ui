import tailwindcss from 'tailwindcss';
import postcssPresetEnv from 'postcss-preset-env';
import type { Config as PostCSSCofnig } from 'postcss-load-config';

export default {
	plugins: [
		tailwindcss(),
		postcssPresetEnv({
			stage: 4,
		}),
	],
} satisfies PostCSSCofnig;
