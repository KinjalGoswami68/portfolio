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
  plugins: [react(), failOnVisibleTodo()],
})

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
