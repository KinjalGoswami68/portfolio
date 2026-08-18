# Kinjal Goswami — Portfolio

A field-log styled personal portfolio. Plain HTML/CSS/JS — no build tools, no npm required.

---

## 1. What's in this folder

```
kinjal-portfolio/
├── index.html              → all page content and structure
├── css/
│   └── style.css           → all visual design (colors, type, layout, animation)
├── js/
│   └── script.js           → intro sequence, scroll effects, counters, project toggles
├── assets/
│   └── resume/
│       └── (add Kinjal_Resume.pdf here)
└── README.md                → this file
```

---

## 2. Open it in VS Code

1. Install [VS Code](https://code.visualstudio.com/) if you don't have it.
2. Download/copy this whole `kinjal-portfolio` folder onto your computer.
3. Open VS Code → **File → Open Folder** → select `kinjal-portfolio`.
4. You'll see the file tree on the left matching the structure above.

**Install one extension** (this is the only "dependency" this project has):
- Go to the Extensions panel (the four-squares icon on the left sidebar, or `Ctrl+Shift+X`).
- Search **"Live Server"** by Ritwick Dey.
- Click **Install**.

There is no `npm install` step — this project doesn't use Node.js or any package manager. That's intentional, so you can focus on the HTML/CSS/JS itself.

---

## 3. Add your resume

1. Open your `Kinjal_Resume.docx` → **File → Download → PDF** (in Word or Google Docs).
2. Name the exported file exactly `Kinjal_Resume.pdf`.
3. Put it inside `assets/resume/`, replacing the placeholder text file.

The "Resume ↓" links in the hero and connect sections already point to this exact path, so once the file is there, they'll work immediately.

---

## 4. Run it locally

1. In VS Code's file tree, right-click `index.html`.
2. Click **"Open with Live Server."**
3. Your browser opens automatically at something like `http://127.0.0.1:5500`.
4. Any time you save a file (`Ctrl+S`), the browser refreshes automatically — this is the fastest way to see your edits.

If you don't want to install the extension, you can also just double-click `index.html` to open it directly in a browser — everything will work, just without the auto-refresh.

---

## 5. Test before you deploy

Go through this checklist in the browser:

- **Intro sequence** — scroll down or click "enter the log," confirm the terminal message types out and the button appears.
- **Spine nav** (desktop only, left sidebar) — scroll through the page and confirm the active section highlights in lime green.
- **Every link** — click GitHub, LinkedIn, X, Medium, Email, and both Resume links. Confirm they open the right place in a new tab.
- **Project cards** — click "SentinelAI" and "Contract Risk Analyzer" to confirm they expand and collapse, and that both live dashboard links work.
- **Numbers section** — scroll to it and confirm the counters animate up to 5000+, 150+, 100+, and 34.
- **Mobile view** — in Chrome DevTools (`F12` → toggle device toolbar, `Ctrl+Shift+M`), check the layout at a phone width (375px). The spine nav should disappear and everything should stack cleanly.
- **Keyboard navigation** — press `Tab` repeatedly from the top of the page. You should see a visible lime outline move between links and buttons, including the project toggles.

---

## 6. Push to GitHub

1. Create a new repository on [github.com](https://github.com/new) — name it something like `portfolio` (don't initialize it with a README, since you already have one).
2. In VS Code, open a terminal: **Terminal → New Terminal**.
3. Run these commands one at a time from inside the `kinjal-portfolio` folder:

```bash
git init
git add .
git commit -m "Initial portfolio"
git branch -M main
git remote add origin https://github.com/KinjalGoswami68/portfolio.git
git push -u origin main
```

(Replace the URL with your actual new repo's URL — GitHub shows you the exact command on the repo's page right after you create it.)

---

## 7. Deploy with GitHub Pages (free, no extra tools)

1. On GitHub, go to your new repo → **Settings → Pages**.
2. Under "Build and deployment," set **Source** to `Deploy from a branch`.
3. Set **Branch** to `main` and folder to `/ (root)`. Click **Save**.
4. Wait about a minute, then refresh the page — GitHub will show you a live URL like:
   `https://kinjalgoswami68.github.io/portfolio/`
5. That's your live portfolio link. Put it in your LinkedIn, X bio, and outreach DMs.

**Whenever you update the site later:** make your edits in VS Code, then run:
```bash
git add .
git commit -m "describe what you changed"
git push
```
GitHub Pages redeploys automatically within a minute or two.

---

## 8. Making it yours going forward

- All the text content lives in `index.html` — search for the section you want to change (e.g. `<section id="builds">`) and edit the text directly.
- All colors and spacing live in `css/style.css` under the `:root` block at the top if you want to adjust the palette.
- When you ship a new project, copy one of the existing `<article class="project-card">` blocks in `index.html`, swap in the new content, and give it a new `id` (e.g. `proj3-body`) in both the button's `aria-controls` and the body's `id`.