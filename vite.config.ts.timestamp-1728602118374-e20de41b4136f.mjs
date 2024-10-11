// vite.config.ts
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "file:///E:/Projects/hyper-magic-window-web-ui/node_modules/.pnpm/vite@5.4.8_@types+node@20.16.11/node_modules/vite/dist/node/index.js";
import vue from "file:///E:/Projects/hyper-magic-window-web-ui/node_modules/.pnpm/@vitejs+plugin-vue@5.1.4_vite@5.4.8_@types+node@20.16.11__vue@3.5.11_typescript@5.4.5_/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import vueJsx from "file:///E:/Projects/hyper-magic-window-web-ui/node_modules/.pnpm/@vitejs+plugin-vue-jsx@4.0.1_vite@5.4.8_@types+node@20.16.11__vue@3.5.11_typescript@5.4.5_/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import vueDevTools from "file:///E:/Projects/hyper-magic-window-web-ui/node_modules/.pnpm/vite-plugin-vue-devtools@7.4.6_rollup@4.24.0_vite@5.4.8_@types+node@20.16.11__vue@3.5.11_typescript@5.4.5_/node_modules/vite-plugin-vue-devtools/dist/vite.mjs";
var __vite_injected_original_import_meta_url = "file:///E:/Projects/hyper-magic-window-web-ui/vite.config.ts";
var vite_config_default = defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools()
  ],
  assetsInclude: ["**/*.xml"],
  // 添加这一行以包括 XML 文件
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxQcm9qZWN0c1xcXFxoeXBlci1tYWdpYy13aW5kb3ctd2ViLXVpXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJFOlxcXFxQcm9qZWN0c1xcXFxoeXBlci1tYWdpYy13aW5kb3ctd2ViLXVpXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9FOi9Qcm9qZWN0cy9oeXBlci1tYWdpYy13aW5kb3ctd2ViLXVpL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZmlsZVVSTFRvUGF0aCwgVVJMIH0gZnJvbSAnbm9kZTp1cmwnXG5cbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSdcbmltcG9ydCB2dWVKc3ggZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlLWpzeCdcbmltcG9ydCB2dWVEZXZUb29scyBmcm9tICd2aXRlLXBsdWdpbi12dWUtZGV2dG9vbHMnXG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgdnVlKCksXG4gICAgdnVlSnN4KCksXG4gICAgdnVlRGV2VG9vbHMoKSxcbiAgXSxcbiAgYXNzZXRzSW5jbHVkZTogWycqKi8qLnhtbCddLCAvLyBcdTZERkJcdTUyQTBcdThGRDlcdTRFMDBcdTg4NENcdTRFRTVcdTUzMDVcdTYyRUMgWE1MIFx1NjU4N1x1NEVGNlxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICdAJzogZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuL3NyYycsIGltcG9ydC5tZXRhLnVybCkpXG4gICAgfVxuICB9XG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF1UyxTQUFTLGVBQWUsV0FBVztBQUUxVSxTQUFTLG9CQUFvQjtBQUM3QixPQUFPLFNBQVM7QUFDaEIsT0FBTyxZQUFZO0FBQ25CLE9BQU8saUJBQWlCO0FBTCtKLElBQU0sMkNBQTJDO0FBUXhPLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLElBQUk7QUFBQSxJQUNKLE9BQU87QUFBQSxJQUNQLFlBQVk7QUFBQSxFQUNkO0FBQUEsRUFDQSxlQUFlLENBQUMsVUFBVTtBQUFBO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxjQUFjLElBQUksSUFBSSxTQUFTLHdDQUFlLENBQUM7QUFBQSxJQUN0RDtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
