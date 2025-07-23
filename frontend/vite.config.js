// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

import { fileURLToPath } from 'node:url';
import { dirname, join, relative, sep, posix } from 'node:path';

function rewriteBackendToFake() {
  const configDir = dirname(fileURLToPath(import.meta.url));       // frontend/
  const projectRoot = join(configDir, '..');                       // monorepo root
  const realBackendRoot = join(projectRoot, 'backend');
  const fakeBackendRoot = join(projectRoot, 'fake-backend');

  return {
    name: 'rewrite-backend-relative',
    enforce: 'pre',
    async resolveId(source, importer) {
      if (source.includes("auth")) {
        console.log("source: " + source + " importer: " + importer);
      };
      if (!source.startsWith('.') || !importer) return null;

      const importerPath = importer.startsWith('file:')
        ? fileURLToPath(importer)
        : importer;

      const absoluteExpected = join(dirname(importerPath), source);
      const absPosix = posix.normalize(absoluteExpected.split(sep).join('/'));

      if (!absPosix.startsWith(realBackendRoot.split(sep).join('/'))) return null;

      const subPath = relative(realBackendRoot, absoluteExpected);
      const rewritten = join(fakeBackendRoot, subPath);

      let ret = this.resolve(rewritten, importer, { skipSelf: true });
      if (source.includes("auth")) {
        console.log(ret);
        ret.then((v)=>{
          console.log(v);
        }, (e)=>{
          console.log("error: " + e);
        });
      }
      return ret;
    }
  };
}



export default defineConfig({
  plugins: [react(), rewriteBackendToFake()],
  build: {
    outDir: 'dist',
  },
  server: {
    port: 5173, // for local dev only
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
