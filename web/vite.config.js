import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

// Virtual module: scan notebooks/ and generate catalog
function notebookCatalogPlugin() {
  const notebooksDir = path.resolve(__dirname, '../notebooks')
  const virtualModuleId = 'virtual:notebook-catalog'
  const resolvedVirtualModuleId = '\0' + virtualModuleId

  function scanNotebooks(dir, base = '') {
    const entries = []
    const items = fs.readdirSync(dir, { withFileTypes: true })
    for (const item of items) {
      const fullPath = path.join(dir, item.name)
      const relPath = base ? `${base}/${item.name}` : item.name
      if (item.isDirectory()) {
        entries.push(...scanNotebooks(fullPath, relPath))
      } else if (item.name.endsWith('.ipynb')) {
        // Extract title from first markdown cell with # heading
        let title = item.name.replace('.ipynb', '')
        try {
          const content = fs.readFileSync(fullPath, 'utf-8')
          const nb = JSON.parse(content)
          for (const cell of nb.cells || []) {
            if (cell.cell_type === 'markdown') {
              const src = Array.isArray(cell.source) ? cell.source.join('') : cell.source
              const match = src.match(/^#\s+(.+)$/m)
              if (match) {
                title = match[1].trim()
                break
              }
            }
          }
        } catch (e) {
          // keep default title
        }
        entries.push({ path: relPath, title })
      }
    }
    return entries
  }

  return {
    name: 'notebook-catalog',
    resolveId(id) {
      if (id === virtualModuleId) return resolvedVirtualModuleId
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        const entries = scanNotebooks(notebooksDir)
        const catalog = entries.map(e => {
          // path like: part1-image-processing/01-digital-image-acquisition/practice.ipynb
          const parts = e.path.split('/')
          const part = parts[0]
          const dir = parts.slice(1, -1).join('/')
          const filename = parts[parts.length - 1]
          const idPath = dir ? `${dir}-${filename.replace('.ipynb', '')}` : filename.replace('.ipynb', '')
          return {
            id: idPath,
            title: e.title,
            path: e.path,
            part,
            partDir: dir,
            filename
          }
        })
        return `export const NOTEBOOK_CATALOG = ${JSON.stringify(catalog, null, 2)};`
      }
    }
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), notebookCatalogPlugin()],
  base: './',
  build: {
    outDir: '../docs',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    open: true,
  },
})
