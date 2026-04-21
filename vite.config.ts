/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/boxly/',
  plugins: [react()],
  test: {
    environment: 'node',
    globals: true,
  },
});
