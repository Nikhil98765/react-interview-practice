import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    watch: {
      // Delay (in milliseconds) before triggering a rebuild/HMR after a file change
      awaitWriteFinish: {
        stabilityThreshold: 500, // Waits 500ms after writing stops before triggering
        pollInterval: 100,
      },
    },
  },
});
