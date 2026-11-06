// npm run check-links
// Requests every external link on the site and reports its status.
// Reads the site's text files (src/data/*.ts) and index.html, so it checks exactly what the site shows.
//
//   OK       the page answered normally (Streamlit: the app is awake)
//   ASLEEP   a Streamlit app showing its "gone to sleep" page (it wakes when someone opens it). not broken
//   UNSURE   a Streamlit app that answered, but showed neither the app nor the sleep message. open it by hand
//   BLOCKED  the site refuses automated checks (LinkedIn, sometimes X/Medium). open these by hand
//   BROKEN   not found, server error, or no answer. these need fixing
//
// Streamlit draws its sleep message with JavaScript, so a plain request can't see it.
// For Streamlit links this opens the page in headless Microsoft Edge (or Chrome; or set BROWSER=path) and reads the text.
//
// Exits with an error code only if something is BROKEN.

import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const sources = [
  ...fs.readdirSync(path.join(root, 'src/data')).map((file) => path.join('src/data', file)),
  'index.html',
]

// collect every https:// link, remembering which file it came from
const links = new Map() // url -> file
for (const file of sources) {
  const text = fs.readFileSync(path.join(root, file), 'utf8')
  for (const match of text.matchAll(/https?:\/\/[^\s'"`)<>]+/g)) {
    const url = match[0].replace(/[.,]$/, '')
    // font servers: fonts.googleapis.com/css2 is checked; the bare preconnect hosts are not pages
    if (url === 'https://fonts.googleapis.com' || url === 'https://fonts.gstatic.com') continue
    if (!links.has(url)) links.set(url, file)
  }
}

// a normal browser-like request. some sites answer bots differently
const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36 link-check',
  Accept: 'text/html,application/xhtml+xml,*/*',
}

// Follows redirects one by one and keeps cookies per website between them, like a browser.
// (Streamlit sends new visitors through a login hop that sets a cookie. without it, it loops forever.)
async function fetchLikeABrowser(startUrl, signal) {
  const jar = new Map() // website -> (cookie name -> "name=value")
  let url = startUrl
  for (let hop = 0; hop < 10; hop++) {
    const host = new URL(url).hostname
    if (!jar.has(host)) jar.set(host, new Map())
    const cookies = jar.get(host)
    const cookieHeader = [...cookies.values()].join('; ')
    const response = await fetch(url, {
      headers: cookieHeader ? { ...headers, Cookie: cookieHeader } : headers,
      redirect: 'manual',
      signal,
    })
    for (const cookie of response.headers.getSetCookie()) {
      const pair = cookie.split(';')[0]
      cookies.set(pair.split('=')[0], pair)
    }
    const next = response.headers.get('location')
    if (response.status < 300 || response.status >= 400 || !next) return { response, finalUrl: url }
    url = new URL(next, url).href
  }
  throw new Error('too many redirects')
}

// ---- headless browser, only used for Streamlit links ----

const BROWSER_PATHS = [
  process.env.BROWSER,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
].filter(Boolean)
let nextPort = 9400

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// One browser at a time: several at once slow each other down and pages stay blank.
let browserQueue = Promise.resolve()
function renderedTextOneAtATime(url) {
  const turn = browserQueue.then(() => renderedText(url))
  browserQueue = turn.catch(() => {})
  return turn
}

// Opens the page in an invisible browser and returns its visible text once some appears
// (checks every second, gives up after 30s). Returns null if no browser is installed.
// Talks to the browser through its built-in DevTools connection, so no extra packages are needed.
async function renderedText(url) {
  const exe = BROWSER_PATHS.find((p) => fs.existsSync(p))
  if (!exe) return null
  const port = nextPort++
  const profile = fs.mkdtempSync(path.join(process.env.TEMP || '/tmp', 'link-check-'))
  const args = ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, '--no-first-run', '--mute-audio', url]
  const browser = spawn(exe, args, { stdio: 'ignore' })
  try {
    let page
    for (let i = 0; i < 40 && !page; i++) {
      await sleep(250)
      try {
        const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json()
        page = targets.find((target) => target.type === 'page')
      } catch {
        // browser not ready yet
      }
    }
    if (!page) return null
    const socket = new WebSocket(page.webSocketDebuggerUrl)
    await new Promise((resolve) => socket.addEventListener('open', resolve))
    const pending = new Map() // request id -> function waiting for the answer
    socket.addEventListener('message', (message) => {
      const data = JSON.parse(message.data)
      pending.get(data.id)?.(data)
    })
    const expression = 'document.body ? document.body.innerText : ""'
    let text = ''
    for (let second = 1; second <= 30 && text.trim() === ''; second++) {
      await sleep(1000) // give the page's JavaScript time to run
      text = await new Promise((resolve) => {
        pending.set(second, (data) => resolve(data.result?.result?.value ?? ''))
        socket.send(JSON.stringify({ id: second, method: 'Runtime.evaluate', params: { expression, returnByValue: true } }))
      })
    }
    socket.close()
    return text
  } finally {
    browser.kill()
  }
}

// ---- checking one link ----

async function check(url) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 20000) // 20 seconds max for the request
  try {
    const { response, finalUrl } = await fetchLikeABrowser(url, controller.signal)
    await response.text() // read the whole answer
    clearTimeout(timer)
    const status = response.status
    const moved = finalUrl.replace(/\/$/, '') !== url.replace(/\/$/, '') ? `ends at ${finalUrl}` : ''

    if ([401, 403, 429, 999].includes(status)) return { kind: 'BLOCKED', status, note: 'refuses automated checks, open it by hand' }
    if (status >= 400) return { kind: 'BROKEN', status, note: response.statusText }

    if (new URL(url).hostname.endsWith('streamlit.app')) {
      const text = await renderedTextOneAtATime(url)
      if (text === null) return { kind: 'UNSURE', status, note: 'no browser found to look for the sleep page' }
      if (/gone to sleep|zzzz/i.test(text)) return { kind: 'ASLEEP', status, note: 'Streamlit sleep page, wakes on first visit' }
      if (text.trim() === '') return { kind: 'UNSURE', status, note: 'page stayed blank for 30s' }
      return { kind: 'OK', status, note: 'Streamlit app is awake' }
    }
    return { kind: 'OK', status, note: moved }
  } catch (error) {
    const reason = error.name === 'AbortError' ? 'no answer within 20s' : error.cause?.code || error.message
    return { kind: 'BROKEN', status: '-', note: reason }
  } finally {
    clearTimeout(timer)
  }
}

console.log(`Checking ${links.size} links (Streamlit apps are opened in a browser, up to 30s each)...\n`)
const results = await Promise.all([...links].map(async ([url, file]) => ({ url, file, ...(await check(url)) })))

for (const kind of ['OK', 'ASLEEP', 'UNSURE', 'BLOCKED', 'BROKEN']) {
  const group = results.filter((result) => result.kind === kind)
  if (group.length === 0) continue
  console.log(`${kind} (${group.length})`)
  for (const result of group) {
    console.log(`  ${String(result.status).padEnd(4)} ${result.url}${result.note ? `   (${result.note})` : ''}   [${result.file}]`)
  }
  console.log('')
}

const broken = results.filter((result) => result.kind === 'BROKEN').length
console.log(broken === 0 ? 'No broken links.' : `${broken} broken link(s).`)
process.exitCode = broken === 0 ? 0 : 1
