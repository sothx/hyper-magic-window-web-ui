import { parse } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { exec } from 'child_process';
import tailwindcss from 'tailwindcss';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { fileURLToPath, URL } from 'node:url';
import postcssPresetEnv from 'postcss-preset-env';
import vueDevTools from 'vite-plugin-vue-devtools';

export default defineConfig({
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
		vueDevTools(),
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
		// legacy({
		//   targets: ['defaults', 'not IE 11'],
		// }),
	],

	// assetsInclude: ['**/*.xml'], // 添加这一行以包括 XML 文件
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
});
