import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(
      // React Compiler (components/metadata.tsx, Part 2). To turn it on:
      //   1. npm i -D babel-plugin-react-compiler   <- NOT installed in this project yet
      //   2. uncomment the line below
      // Uncommenting without step 1 fails the dev server ("Cannot find package").
      // { babel: { plugins: ['babel-plugin-react-compiler'] } }
    )
  ],
})
