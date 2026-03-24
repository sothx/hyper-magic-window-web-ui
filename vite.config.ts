import path from 'node:path';
import { parse } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { exec } from 'child_process';
import tailwindcss from 'tailwindcss';
import vueJsx from '@vitejs/plugin-vue-jsx';
import postcssPresetEnv from 'postcss-preset-env';
import vueDevTools from 'vite-plugin-vue-devtools';

export default defineConfig(({ mode }) => ({
	css: {
		postcss: {
			plugins: [
				tailwindcss(),
				postcssPresetEnv({
					stage: 4,
				}),
			],
		},
	},
	plugins: [
		vue(),
		vueJsx(),
		mode === 'development' ? vueDevTools() : null,
		{
			name: 'run-powershell-command',
			configureServer(server) {
				server.middlewares.use('/api/exec', (req, res) => {
					if (process.env.NODE_ENV === 'development') {
						const queryObject = parse(req.url as string, true).query;
						const command = queryObject.cmd as string; // 默认命令
						const shell = process.platform === 'win32' ? 'powershell.exe' : '/bin/bash';
						if (command) {
							exec(
								command,
								{
									shell,
								},
								(error, stdout, stderr) => {
									if (error) {
										res.statusCode = 500;
										res.end(`Error: ${error.message}`);
										return;
									}
									if (stderr) {
										res.statusCode = 500;
										res.end(`Error: ${stderr}`);
										return;
									}
									res.statusCode = 200;
									res.end(stdout); // 返回命令执行结果
								},
							);
						} else {
							res.statusCode = 500;
							res.end(`Error: unknow command`);
						}
					}
				});
			},
		},
		// visualizer({
		// 	open: true,
		// 	gzipSize: false
		// }),
		// legacy({
		//     targets: ['defaults', 'not IE 11', 'chrome >= 87', 'android >= 5.0'],
		//     additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
		//     renderLegacyChunks: true,
		//     polyfills: [
		//       'es.symbol',
		//       'es.promise',
		//       'es.promise.finally',
		//       'es/map',
		//       'es/set',
		//       'es.array.filter',
		//       'es.array.for-each',
		//       'es.array.flat-map',
		//       'es.object.define-properties',
		//       'es.object.define-property',
		//       'es.object.get-own-property-descriptor',
		//       'es.object.get-own-property-descriptors',
		//       'es.object.keys',
		//       'es.object.to-string',
		//       'web.dom-collections.for-each',
		//       'esnext.global-this',
		//       'esnext.string.match-all'
		//     ]
		//   })
	],
	build: {
		minify: 'terser',
		rollupOptions: {
			output: {
				manualChunks(id) {
					const normalizedId = id.replace(/\\/g, '/');

					if (normalizedId.includes('node_modules/vue') || normalizedId.includes('node_modules/@vue')) {
						return 'vendor-vue';
					}
					if (normalizedId.includes('node_modules/naive-ui/es')) {
						if (normalizedId.includes('/_internal/')) {
							return 'vendor-naive-internal';
						}
						if (normalizedId.includes('/data-table/')) {
							return 'vendor-naive-data-table';
						}
						if (normalizedId.includes('/input/') || normalizedId.includes('/input-number/')) {
							return 'vendor-naive-input';
						}
						if (normalizedId.includes('/tabs/') || normalizedId.includes('/select/')) {
							return 'vendor-naive-form';
						}
						if (
							normalizedId.includes('/dialog/') ||
							normalizedId.includes('/modal/') ||
							normalizedId.includes('/message/') ||
							normalizedId.includes('/notification/') ||
							normalizedId.includes('/drawer/')
						) {
							return 'vendor-naive-feedback';
						}
						return 'vendor-naive-core';
					}
					if (normalizedId.includes('node_modules/pinia')) {
						return 'vendor-pinia';
					}
					if (normalizedId.includes('node_modules/vue-router')) {
						return 'vendor-router';
					}
					if (normalizedId.includes('node_modules/lodash')) {
						return 'vendor-lodash';
					}
					if (normalizedId.includes('node_modules/pako')) {
						return 'pako';
					}
					if (normalizedId.includes('iconfont')) {
						return 'iconfont';
					}
					if (normalizedId.includes('hooks')) {
						return 'hooks';
					}
					if (normalizedId.includes('apis')) {
						return 'apis';
					}
				},
			},
		},
	},
	assetsInclude: ['**/*.xml'], // 添加这一行以包括 XML 文件
	resolve: {
		alias: {
			'@': path.resolve(import.meta.dirname, './src'),
			$: path.resolve(import.meta.dirname, './node_modules'),
		},
	},
}));
