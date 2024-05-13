import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import { createHtmlPlugin } from "vite-plugin-html";
import legacy from "@vitejs/plugin-legacy";

import { viteStaticCopy } from 'vite-plugin-static-copy'


export default ({ mode }) => {
  let devEnv = "";
  const env = Object.assign(
    globalThis.process.env,
    loadEnv(mode, globalThis.process.cwd())
  );

  if (mode === "development") {
    devEnv = `
      <script>
        var DEBUG = "${env.VITE_DEBUG}" === 'true';
        var DEBUG_HOST = "${env.VITE_DEBUG_HOST}";
        var DEBUG_PORT = "${env.VITE_DEBUG_MDS_PORT}";
        var DEBUG_UID = "${env.VITE_DEBUG_UID}";
      </script>
    `;
  }

  return defineConfig({
    base: "",
    build: {
      outDir: "build",
    },
    plugins: [
      react(),
      legacy({
        targets: ["defaults", "not IE 11", "Android >= 9"],
      }),
      viteStaticCopy({
        targets: [
          { src: '../dapp/js/*', dest: './js', transform(content, path) {
            const modifiedContent = content.replace(/^(?:import .*?;|export .*?;)\s*/gm, '');                      
            
            return modifiedContent;
          }},
          { src: '../dapp/service.js', dest: '.'},
          { src: '../dapp/abi/*', dest: './abi', transform(content, path) {
            const modifiedContent = content.replace(/^(?:import .*?;|export .*?;)\s*/gm, '');                      
            
            return modifiedContent;
          }},
        ]
      }),
      createHtmlPlugin({
        inject: {
          data: {
            devEnv,
          },
        },
      }),
    ],
  });
};


