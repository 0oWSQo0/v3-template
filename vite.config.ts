import { defineConfig, loadEnv } from "vite";
import createVitePlugins from "./vite/plugins";
import path from "path";

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd());
  const { VITE_APP_ENV, VITE_APP_BASE_API } = env;

  return {
    plugins: createVitePlugins(env, command === "build"),
    // 部署生产环境和开发环境下的URL。
    //如果你的应用被部署在 https://www.xxx.com/admin/，则设置 /admin/。
    base: VITE_APP_ENV === "production" ? "/" : "/",
    server: {
      port: 88,
      host: true,
      open: true,
      proxy: {
        [VITE_APP_BASE_API]: {
          target: "http://172.16.20.238:9088",
          changeOrigin: true,
          rewrite: (p) => p.replace(new RegExp('^' + VITE_APP_BASE_API), ""),
        },
      },
    },
    resolve: {
      alias: {
        // 设置路径
        "~": path.resolve(__dirname, "./"),
        // 设置别名
        "@": path.resolve(__dirname, "./src"),
      }
    }
  };
});
