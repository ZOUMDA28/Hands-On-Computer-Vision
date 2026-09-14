import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { existsSync, readdirSync, readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const repoRoot = fileURLToPath(new URL('..', import.meta.url))

function normalizeNotebookSource(source) {
  return Array.isArray(source) ? source.join('') : source || ''
}

function stripMarkdownInline(value) {
  return String(value)
    .replace(/^#+\s*/, '')
    .replace(/\s+#+$/, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim()
}

function getNotebookTitle(filePath, fallback) {
  try {
    const nb = JSON.parse(readFileSync(filePath, 'utf-8'))
    for (const cell of nb.cells || []) {
      if (cell.cell_type !== 'markdown') continue
      const source = normalizeNotebookSource(cell.source)
      const heading = source.match(/^#\s+(.+)$/m)
      if (heading) return stripMarkdownInline(heading[1])
    }
  } catch {
    // Invalid notebooks should fail visibly in the viewer when opened.
  }
  return fallback
}

function listNotebookFiles(dir) {
  if (!existsSync(dir)) return []

  const entries = readdirSync(dir, { withFileTypes: true })
  return entries.flatMap((entry) => {
    const entryPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      // 跳过 Hands-on-CV 参考副本目录和其他非教程目录
      if (entry.name === 'Hands-on-CV' || entry.name.startsWith('.')) return []
      return listNotebookFiles(entryPath)
    }
    // 跳过 practice_extra 重复章节（Hands-on-CV 参考副本）
    if (entry.name === 'practice_extra.ipynb') return []
    return entry.isFile() && entry.name.endsWith('.ipynb') ? [entryPath] : []
  })
}

function buildNotebookCatalogFor(rootDir) {
  const catalog = {}
  const baseDir = path.join(repoRoot, rootDir)

  for (const filePath of listNotebookFiles(baseDir)) {
    const rel = path.relative(baseDir, filePath).replaceAll(path.sep, '/')
    const match = rel.match(/^([^/]+)\/(.+)\.ipynb$/)
    if (!match) continue
    const [, partDir, idPath] = match
    const id = idPath.replace(/\//g, '-')
    catalog[id] = {
      partDir,
      title: getNotebookTitle(filePath, id),
    }
  }

  return catalog
}

function buildNotebookCatalog() {
  return {
    zh: buildNotebookCatalogFor('notebooks'),
  }
}

function notebookCatalogPlugin() {
  const virtualModuleId = 'virtual:notebook-catalog'
  const resolvedVirtualModuleId = '\0' + virtualModuleId
  const watchedDirs = [
    path.join(repoRoot, 'notebooks'),
  ]

  return {
    name: 'vite-plugin-notebook-catalog',
    resolveId(id) {
      if (id === virtualModuleId) return resolvedVirtualModuleId
    },
    configureServer(server) {
      // Watch the directory trees so renames / new subdirectories trigger reloads
      for (const dir of watchedDirs) {
        server.watcher.add(dir)
      }

      // chokidar 的监听器是全局的，只注册一组；并合并原子保存产生的连续事件。
      let reloadTimer = null
      const scheduleRebuild = (event) => (file) => {
        if (!file || !file.endsWith('.ipynb')) return
        clearTimeout(reloadTimer)
        reloadTimer = setTimeout(() => {
          const mod = server.moduleGraph.getModuleById(resolvedVirtualModuleId)
          if (!mod) return
          server.moduleGraph.invalidateModule(mod)
          server.ws.send({ type: 'full-reload' })
          server.config.logger.info(`[notebook-catalog] ${event}: ${path.basename(file)}`, {
            timestamp: true,
          })
        }, 100)
      }
      server.watcher.on('change', scheduleRebuild('change'))
      server.watcher.on('add', scheduleRebuild('add'))
      server.watcher.on('unlink', scheduleRebuild('unlink'))
      server.httpServer?.once('close', () => clearTimeout(reloadTimer))
    },
    buildStart() {
      // Also add individual files for build-mode watching
      for (const filePath of listNotebookFiles(path.join(repoRoot, 'notebooks'))) {
        this.addWatchFile(filePath)
      }
    },
    load(id) {
      if (id !== resolvedVirtualModuleId) return
      return `export const NOTEBOOK_CATALOG = ${JSON.stringify(buildNotebookCatalog())}`
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), notebookCatalogPlugin()],
  base: './',
  server: {
    host: '127.0.0.1',
    port: 5274,
    strictPort: false,
    fs: {
      allow: [repoRoot],
    },
  },
  build: {
    outDir: '../docs',
    emptyOutDir: true,
  },
})
