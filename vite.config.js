import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// One request per visit: JS, CSS, fonts and photos are all inlined into index.html.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
})
