import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  // Load environment variables
  // const env = loadEnv(mode, process.cwd(), 'VITE');
  const env = loadEnv(mode, process.cwd(), '');


  return {
    plugins: [tailwindcss(), react()],
  };
});














