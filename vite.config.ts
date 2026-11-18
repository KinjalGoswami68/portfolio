import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

// GitHub Pages serves the site from a sub-folder: https://kinjalgoswami68.github.io/portfolio/
// Every file path in the code uses import.meta.env.BASE_URL, which becomes this value.
const BASE = '/portfolio/'

const projectRoot = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  base: BASE,
  plugins: [react(), failOnVisibleTodo(), fetchEarly()],
  define: {
    // the footer shows the Resume link if the pdf is in public/resume/. checked here, once,
    // so the link never depends on a network request
    __RESUME_EXISTS__: JSON.stringify(fs.existsSync(path.join(projectRoot, 'public/resume/Kinjal_Resume.pdf'))),
  },
})

// Adds two hints to the built index.html, so the browser starts these right away and at high priority:
// - the 3D file (Scene-*.js). it is loaded lazily, so without this it would only start once the main
//   script has run, and on a slow connection it would queue behind the big model download
// - the title font (Anton), used on the intro name and the 3D panels
function fetchEarly(): Plugin {
  return {
    name: 'fetch-early',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(_html, context) {
        if (!context.bundle) return []
        const files = Object.values(context.bundle)
        const scene = files.find((file) => file.type === 'chunk' && file.name === 'Scene')
        const titleFont = files.find((file) => file.type === 'asset' && /anton-latin.*\.woff2$/.test(file.fileName))
        const tags = []
        if (scene) tags.push({ tag: 'link', attrs: { rel: 'modulepreload', crossorigin: '', href: BASE + scene.fileName }, injectTo: 'head' as const })
        if (titleFont) tags.push({ tag: 'link', attrs: { rel: 'preload', as: 'font', type: 'font/woff2', crossorigin: '', href: BASE + titleFont.fileName }, injectTo: 'head' as const })
        return tags
      },
    },
  }
}

// Stops `npm run build` (not `npm run dev`) if any "TODO" would be visible on the live site,
// and lists where. All site text lives in src/data/, so that's what it reads.
function failOnVisibleTodo(): Plugin {
  return {
    name: 'fail-on-visible-todo',
    apply: 'build',
    buildStart() {
      const problems: string[] = []
      const dataFolder = path.join(projectRoot, 'src/data')
      const resumeExists = fs.existsSync(path.join(projectRoot, 'public/resume/Kinjal_Resume.pdf'))

      for (const file of fs.readdirSync(dataFolder)) {
        const lines = fs.readFileSync(path.join(dataFolder, file), 'utf8').split('\n')
        lines.forEach((line, i) => {
          // ignore comments (a // after a space or at the start; not the // inside https://)
          const code = line.replace(/(^|\s)\/\/.*$/, '')
          if (!code.includes('TODO')) return
          const where = `src/data/${file}:${i + 1}`
          // the resume TODO only shows while the pdf is missing, so check the pdf instead
          if (line.includes('build-check: resume')) {
            if (!resumeExists) problems.push(`${where}  public/resume/Kinjal_Resume.pdf is missing, so the footer would show a TODO`)
            return
          }
          problems.push(`${where}  ${code.trim()}`)
        })
      }

      if (problems.length > 0) {
        this.error(`Visible TODO text would appear on the site. Fix these first:\n  ${problems.join('\n  ')}`)
      }
    },
  }
}
