// vite.config.ts
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "file:///E:/Projects/hyper-magic-window-web-ui/node_modules/.pnpm/vite@5.4.8_@types+node@20.16.11_terser@5.36.0/node_modules/vite/dist/node/index.js";
import vue from "file:///E:/Projects/hyper-magic-window-web-ui/node_modules/.pnpm/@vitejs+plugin-vue@5.1.4_vite@5.4.8_@types+node@20.16.11_terser@5.36.0__vue@3.5.11_typescript@5.4.5_/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import vueJsx from "file:///E:/Projects/hyper-magic-window-web-ui/node_modules/.pnpm/@vitejs+plugin-vue-jsx@4.0.1_vite@5.4.8_@types+node@20.16.11_terser@5.36.0__vue@3.5.11_typescript@5.4.5_/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import vueDevTools from "file:///E:/Projects/hyper-magic-window-web-ui/node_modules/.pnpm/vite-plugin-vue-devtools@7.4.6_rollup@4.24.0_vite@5.4.8_@types+node@20.16.11_terser@5.36.0__vue@3.5.11_typescript@5.4.5_/node_modules/vite-plugin-vue-devtools/dist/vite.mjs";
import { exec } from "child_process";
import { parse } from "url";
import "file:///E:/Projects/hyper-magic-window-web-ui/node_modules/.pnpm/@vitejs+plugin-legacy@5.4.2_terser@5.36.0_vite@5.4.8_@types+node@20.16.11_terser@5.36.0_/node_modules/@vitejs/plugin-legacy/dist/index.mjs";
var __vite_injected_original_import_meta_url = "file:///E:/Projects/hyper-magic-window-web-ui/vite.config.ts";
var vite_config_default = defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    {
      name: "run-powershell-command",
      configureServer(server) {
        server.middlewares.use("/api/exec", (req, res) => {
          if (process.env.NODE_ENV === "development") {
            const queryObject = parse(req.url, true).query;
            const command = queryObject.cmd;
            const shell = process.platform === "win32" ? "powershell.exe" : "/bin/bash";
            if (command) {
              exec(command, {
                shell
              }, (error, stdout, stderr) => {
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
                res.end(stdout);
              });
            } else {
              res.statusCode = 500;
              res.end(`Error: unknow command`);
            }
          }
        });
      }
    }
    // legacy({
    //   targets: ['defaults', 'not IE 11'],
    // }),
  ],
  // assetsInclude: ['**/*.xml'], // 添加这一行以包括 XML 文件
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxQcm9qZWN0c1xcXFxoeXBlci1tYWdpYy13aW5kb3ctd2ViLXVpXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJFOlxcXFxQcm9qZWN0c1xcXFxoeXBlci1tYWdpYy13aW5kb3ctd2ViLXVpXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9FOi9Qcm9qZWN0cy9oeXBlci1tYWdpYy13aW5kb3ctd2ViLXVpL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZmlsZVVSTFRvUGF0aCwgVVJMIH0gZnJvbSAnbm9kZTp1cmwnXG5cbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSdcbmltcG9ydCB2dWVKc3ggZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlLWpzeCdcbmltcG9ydCB2dWVEZXZUb29scyBmcm9tICd2aXRlLXBsdWdpbi12dWUtZGV2dG9vbHMnXG5pbXBvcnQgeyBleGVjIH0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgeyBTZXJ2ZXJSZXNwb25zZSB9IGZyb20gJ2h0dHAnO1xuaW1wb3J0IHsgcGFyc2UgfSBmcm9tICd1cmwnO1xuaW1wb3J0IGxlZ2FjeSBmcm9tICdAdml0ZWpzL3BsdWdpbi1sZWdhY3knXG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgdnVlKCksXG4gICAgdnVlSnN4KCksXG4gICAgdnVlRGV2VG9vbHMoKSxcbiAgICB7XG4gICAgICBuYW1lOiBcInJ1bi1wb3dlcnNoZWxsLWNvbW1hbmRcIixcbiAgICAgIGNvbmZpZ3VyZVNlcnZlcihzZXJ2ZXIpIHtcbiAgICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZSgnL2FwaS9leGVjJywgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAnZGV2ZWxvcG1lbnQnKSB7XG4gICAgICAgICAgICBjb25zdCBxdWVyeU9iamVjdCA9IHBhcnNlKHJlcS51cmwgYXMgc3RyaW5nLCB0cnVlKS5xdWVyeTtcbiAgICAgICAgICAgIGNvbnN0IGNvbW1hbmQgPSBxdWVyeU9iamVjdC5jbWQgYXMgc3RyaW5nICAvLyBcdTlFRDhcdThCQTRcdTU0N0RcdTRFRTRcbiAgICAgICAgICAgIGNvbnN0IHNoZWxsID0gcHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJyA/ICdwb3dlcnNoZWxsLmV4ZScgOiAnL2Jpbi9iYXNoJztcbiAgICAgICAgICAgIGlmIChjb21tYW5kKSB7XG4gICAgICAgICAgICAgIGV4ZWMoY29tbWFuZCx7XG4gICAgICAgICAgICAgICAgc2hlbGxcbiAgICAgICAgICAgICAgfSwgKGVycm9yLCBzdGRvdXQsIHN0ZGVycikgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA1MDA7XG4gICAgICAgICAgICAgICAgICByZXMuZW5kKGBFcnJvcjogJHtlcnJvci5tZXNzYWdlfWApO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoc3RkZXJyKSB7XG4gICAgICAgICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDUwMDtcbiAgICAgICAgICAgICAgICAgIHJlcy5lbmQoYEVycm9yOiAke3N0ZGVycn1gKTtcbiAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSAyMDA7XG4gICAgICAgICAgICAgICAgcmVzLmVuZChzdGRvdXQpOyAgLy8gXHU4RkQ0XHU1NkRFXHU1NDdEXHU0RUU0XHU2MjY3XHU4ODRDXHU3RUQzXHU2NzlDXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA1MDA7XG4gICAgICAgICAgICAgIHJlcy5lbmQoYEVycm9yOiB1bmtub3cgY29tbWFuZGApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9LFxuICAgIC8vIGxlZ2FjeSh7XG4gICAgLy8gICB0YXJnZXRzOiBbJ2RlZmF1bHRzJywgJ25vdCBJRSAxMSddLFxuICAgIC8vIH0pLFxuICBdLFxuICBcbiAgLy8gYXNzZXRzSW5jbHVkZTogWycqKi8qLnhtbCddLCAvLyBcdTZERkJcdTUyQTBcdThGRDlcdTRFMDBcdTg4NENcdTRFRTVcdTUzMDVcdTYyRUMgWE1MIFx1NjU4N1x1NEVGNlxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICdAJzogZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuL3NyYycsIGltcG9ydC5tZXRhLnVybCkpXG4gICAgfVxuICB9XG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF1UyxTQUFTLGVBQWUsV0FBVztBQUUxVSxTQUFTLG9CQUFvQjtBQUM3QixPQUFPLFNBQVM7QUFDaEIsT0FBTyxZQUFZO0FBQ25CLE9BQU8saUJBQWlCO0FBQ3hCLFNBQVMsWUFBWTtBQUVyQixTQUFTLGFBQWE7QUFDdEIsT0FBbUI7QUFUb0ssSUFBTSwyQ0FBMkM7QUFZeE8sSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsSUFBSTtBQUFBLElBQ0osT0FBTztBQUFBLElBQ1AsWUFBWTtBQUFBLElBQ1o7QUFBQSxNQUNFLE1BQU07QUFBQSxNQUNOLGdCQUFnQixRQUFRO0FBQ3RCLGVBQU8sWUFBWSxJQUFJLGFBQWEsQ0FBQyxLQUFLLFFBQVE7QUFDaEQsY0FBSSxRQUFRLElBQUksYUFBYSxlQUFlO0FBQzFDLGtCQUFNLGNBQWMsTUFBTSxJQUFJLEtBQWUsSUFBSSxFQUFFO0FBQ25ELGtCQUFNLFVBQVUsWUFBWTtBQUM1QixrQkFBTSxRQUFRLFFBQVEsYUFBYSxVQUFVLG1CQUFtQjtBQUNoRSxnQkFBSSxTQUFTO0FBQ1gsbUJBQUssU0FBUTtBQUFBLGdCQUNYO0FBQUEsY0FDRixHQUFHLENBQUMsT0FBTyxRQUFRLFdBQVc7QUFDNUIsb0JBQUksT0FBTztBQUNULHNCQUFJLGFBQWE7QUFDakIsc0JBQUksSUFBSSxVQUFVLE1BQU0sT0FBTyxFQUFFO0FBQ2pDO0FBQUEsZ0JBQ0Y7QUFDQSxvQkFBSSxRQUFRO0FBQ1Ysc0JBQUksYUFBYTtBQUNqQixzQkFBSSxJQUFJLFVBQVUsTUFBTSxFQUFFO0FBQzFCO0FBQUEsZ0JBQ0Y7QUFDQSxvQkFBSSxhQUFhO0FBQ2pCLG9CQUFJLElBQUksTUFBTTtBQUFBLGNBQ2hCLENBQUM7QUFBQSxZQUNILE9BQU87QUFDTCxrQkFBSSxhQUFhO0FBQ2pCLGtCQUFJLElBQUksdUJBQXVCO0FBQUEsWUFDakM7QUFBQSxVQUNGO0FBQUEsUUFDRixDQUFDO0FBQUEsTUFDSDtBQUFBLElBQ0Y7QUFBQTtBQUFBO0FBQUE7QUFBQSxFQUlGO0FBQUE7QUFBQSxFQUdBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssY0FBYyxJQUFJLElBQUksU0FBUyx3Q0FBZSxDQUFDO0FBQUEsSUFDdEQ7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
