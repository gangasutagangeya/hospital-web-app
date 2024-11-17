// vite.config.ts
import { vitePlugin as remix } from "file:///Users/yaswanth/Documents/software_projects/gangasutagangeya/hospital-web-app/node_modules/@remix-run/dev/dist/index.js";
import { flatRoutes } from "file:///Users/yaswanth/Documents/software_projects/gangasutagangeya/hospital-web-app/node_modules/remix-flat-routes/dist/index.js";
import { defineConfig } from "file:///Users/yaswanth/Documents/software_projects/gangasutagangeya/hospital-web-app/node_modules/vite/dist/node/index.js";
var MODE = process.env.NODE_ENV;
var vite_config_default = defineConfig({
  build: {
    cssMinify: MODE === "production",
    rollupOptions: {
      external: [/node:.*/, "stream", "crypto", "fsevents"]
    }
  },
  plugins: [
    remix({
      ignoredRouteFiles: ["**/*"],
      serverModuleFormat: "esm",
      routes: async (defineRoutes) => {
        return flatRoutes("routes", defineRoutes, {
          ignoredRouteFiles: [
            ".*",
            "**/*.css",
            "**/*.test.{js,jsx,ts,tsx}",
            "**/__*.*",
            // This is for server-side utilities you want to colocate next to
            // your routes without making an additional directory.
            // If you need a route that includes "server" or "client" in the
            // filename, use the escape brackets like: my-route.[server].tsx
            "**/*.server.*",
            "**/*.client.*"
          ]
        });
      }
    })
  ]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMveWFzd2FudGgvRG9jdW1lbnRzL3NvZnR3YXJlX3Byb2plY3RzL2dhbmdhc3V0YWdhbmdleWEvaG9zcGl0YWwtd2ViLWFwcFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL3lhc3dhbnRoL0RvY3VtZW50cy9zb2Z0d2FyZV9wcm9qZWN0cy9nYW5nYXN1dGFnYW5nZXlhL2hvc3BpdGFsLXdlYi1hcHAvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL3lhc3dhbnRoL0RvY3VtZW50cy9zb2Z0d2FyZV9wcm9qZWN0cy9nYW5nYXN1dGFnYW5nZXlhL2hvc3BpdGFsLXdlYi1hcHAvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyB2aXRlUGx1Z2luIGFzIHJlbWl4IH0gZnJvbSAnQHJlbWl4LXJ1bi9kZXYnXG5pbXBvcnQgeyBmbGF0Um91dGVzIH0gZnJvbSAncmVtaXgtZmxhdC1yb3V0ZXMnXG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuXG5jb25zdCBNT0RFID0gcHJvY2Vzcy5lbnYuTk9ERV9FTlZcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcblx0YnVpbGQ6IHtcblx0XHRjc3NNaW5pZnk6IE1PREUgPT09ICdwcm9kdWN0aW9uJyxcblx0XHRyb2xsdXBPcHRpb25zOiB7XG5cdFx0XHRleHRlcm5hbDogWy9ub2RlOi4qLywgJ3N0cmVhbScsICdjcnlwdG8nLCAnZnNldmVudHMnXSxcblx0XHR9LFxuXHR9LFxuXHRwbHVnaW5zOiBbXG5cdFx0cmVtaXgoe1xuXHRcdFx0aWdub3JlZFJvdXRlRmlsZXM6IFsnKiovKiddLFxuXHRcdFx0c2VydmVyTW9kdWxlRm9ybWF0OiAnZXNtJyxcblx0XHRcdHJvdXRlczogYXN5bmMgZGVmaW5lUm91dGVzID0+IHtcblx0XHRcdFx0cmV0dXJuIGZsYXRSb3V0ZXMoJ3JvdXRlcycsIGRlZmluZVJvdXRlcywge1xuXHRcdFx0XHRcdGlnbm9yZWRSb3V0ZUZpbGVzOiBbXG5cdFx0XHRcdFx0XHQnLionLFxuXHRcdFx0XHRcdFx0JyoqLyouY3NzJyxcblx0XHRcdFx0XHRcdCcqKi8qLnRlc3Que2pzLGpzeCx0cyx0c3h9Jyxcblx0XHRcdFx0XHRcdCcqKi9fXyouKicsXG5cdFx0XHRcdFx0XHQvLyBUaGlzIGlzIGZvciBzZXJ2ZXItc2lkZSB1dGlsaXRpZXMgeW91IHdhbnQgdG8gY29sb2NhdGUgbmV4dCB0b1xuXHRcdFx0XHRcdFx0Ly8geW91ciByb3V0ZXMgd2l0aG91dCBtYWtpbmcgYW4gYWRkaXRpb25hbCBkaXJlY3RvcnkuXG5cdFx0XHRcdFx0XHQvLyBJZiB5b3UgbmVlZCBhIHJvdXRlIHRoYXQgaW5jbHVkZXMgXCJzZXJ2ZXJcIiBvciBcImNsaWVudFwiIGluIHRoZVxuXHRcdFx0XHRcdFx0Ly8gZmlsZW5hbWUsIHVzZSB0aGUgZXNjYXBlIGJyYWNrZXRzIGxpa2U6IG15LXJvdXRlLltzZXJ2ZXJdLnRzeFxuXHRcdFx0XHRcdFx0JyoqLyouc2VydmVyLionLFxuXHRcdFx0XHRcdFx0JyoqLyouY2xpZW50LionLFxuXHRcdFx0XHRcdF0sXG5cdFx0XHRcdH0pXG5cdFx0XHR9LFxuXHRcdH0pLFxuXHRdLFxufSlcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBeVosU0FBUyxjQUFjLGFBQWE7QUFDN2IsU0FBUyxrQkFBa0I7QUFDM0IsU0FBUyxvQkFBb0I7QUFFN0IsSUFBTSxPQUFPLFFBQVEsSUFBSTtBQUV6QixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMzQixPQUFPO0FBQUEsSUFDTixXQUFXLFNBQVM7QUFBQSxJQUNwQixlQUFlO0FBQUEsTUFDZCxVQUFVLENBQUMsV0FBVyxVQUFVLFVBQVUsVUFBVTtBQUFBLElBQ3JEO0FBQUEsRUFDRDtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1IsTUFBTTtBQUFBLE1BQ0wsbUJBQW1CLENBQUMsTUFBTTtBQUFBLE1BQzFCLG9CQUFvQjtBQUFBLE1BQ3BCLFFBQVEsT0FBTSxpQkFBZ0I7QUFDN0IsZUFBTyxXQUFXLFVBQVUsY0FBYztBQUFBLFVBQ3pDLG1CQUFtQjtBQUFBLFlBQ2xCO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxZQUtBO0FBQUEsWUFDQTtBQUFBLFVBQ0Q7QUFBQSxRQUNELENBQUM7QUFBQSxNQUNGO0FBQUEsSUFDRCxDQUFDO0FBQUEsRUFDRjtBQUNELENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
