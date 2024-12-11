import type { Config } from 'tailwindcss';

export default {
	mode: 'jit',
	content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
	theme: {
		extend: {},
		screens: {
		  'sm': '640px',
		  'md': '768px',
		  'lg': '896px', // 修改默认 lg 断点
		  'xl': '1024px',
		  '2xl': '1280px',
		},
	}
} satisfies Config;
