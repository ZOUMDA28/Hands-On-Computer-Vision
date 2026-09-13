import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// 虚拟模块：自动扫描 notebooks 目录生成目录
function notebookCatalogPlugin() {
  const virtualModuleId = 'virtual:notebook-catalog'
  const resolvedVirtualModuleId = '\0' + virtualModuleId

  return {
    name: 'notebook-catalog',
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        const notebooksDir = resolve(__dirname, '../notebooks')
        const catalog = scanNotebooks(notebooksDir)
        return `export const notebookCatalog = ${JSON.stringify(catalog, null, 2)};`
      }
    }
  }
}

function scanNotebooks(dir, basePath = '') {
  const result = []
  if (!fs.existsSync(dir)) return result
  
  const items = fs.readdirSync(dir, { withFileTypes: true })
  for (const item of items) {
    if (item.isDirectory()) {
      const subPath = basePath ? `${basePath}/${item.name}` : item.name
      const children = scanNotebooks(resolve(dir, item.name), subPath)
      if (children.length > 0) {
        result.push({
          type: 'section',
          id: item.name,
          title: formatTitle(item.name),
          children
        })
      }
    } else if (item.name.endsWith('.ipynb')) {
      const id = item.name.replace('.ipynb', '')
      result.push({
        type: 'notebook',
        id: id,
        title: formatTitle(id),
        path: `${basePath}/${item.name}`
      })
    }
  }
  return result
}

function formatTitle(name) {
  return name
    .replace(/^\d+-/, '')
    .replace(/-/g, ' ')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

export default defineConfig({
  plugins: [
    react(),
    notebookCatalogPlugin()
  ],
  base: './',
  build: {
    outDir: '../docs',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'markdown': ['marked', 'highlight.js', 'katex']
        }
      }
    }
  },
  server: {
    port: 5173,
    open: true
  }
})
