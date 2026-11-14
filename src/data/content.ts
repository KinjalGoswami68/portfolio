// Site copy outside the ring. Every word and link is copied from CONTENT.md.
// 'TODO' = not given yet. It stays visible on the site until it's filled in.

export const intro = {
  smallLine: "Hi, I'm",
  name: 'KINJAL GOSWAMI',
  lines: ['ML Engineer.', '2nd Year CS Student.'],
  facts: [
    'Won 1st Prize at Hacktoberfest Hack Day 2026',
    'I build ML models, AI agents',
    'Currently: AI Intern at DataFlirt',
  ],
  button: 'Wanna know more?',
}

export const hero = {
  backLink: 'Back to intro',
}

// buttons and headings in the project detail card (CONTENT.md "labels")
export const detailLabels = {
  close: 'Close',
  whatItIs: 'What it is',
  demo: 'The demo',
  tryIt: 'Try it',
  honestLimit: 'Honest limit',
  fieldNotes: 'Field notes',
  stack: 'Stack',
  tags: 'Tags',
  team: 'Team',
}

export type SocialLink = {
  label: string
  url: string
  external: boolean // true = opens in a new tab
}

// the footer bar links, from CONTENT.md "footer bar"
export const footerLinks: SocialLink[] = [
  { label: 'GitHub', url: 'https://github.com/KinjalGoswami68', external: true },
  { label: 'LinkedIn', url: 'https://linkedin.com/in/kinjal-goswami-03738a376', external: true },
  { label: 'X', url: 'https://x.com/KGoswami70', external: true },
  { label: 'Medium', url: 'https://medium.com/@kinjalgoswami682', external: true },
  { label: 'Email', url: 'mailto:kinjalgoswami682@gmail.com', external: false },
]

export const resume = {
  label: 'Resume',
  url: `${import.meta.env.BASE_URL}resume/Kinjal_Resume.pdf`,
  missing: "TODO: copy the pdf into public/resume/", // build-check: resume (shown only while the pdf is missing)
}

export const copyright = '© 2026 Kinjal Goswami' // right end of the footer bar

// ---- chapters below the ring (CONTENT.md "chapters") ----

export const chapters = {
  rightNow: {
    title: 'Right Now',
    role: 'AI Intern · DataFlirt (Bengaluru, Remote) · Oct 2026',
    text: 'Building the systems that collect, store and serve data: self-healing Python scrapers, Postgres storage with dedup, FastAPI APIs tracked at p50/p95, deploys on AWS/GCP, and keeping LLM token costs measured.',
  },
  wins: {
    title: 'Wins',
    // opens = the id of the project panel it opens
    items: [
      { text: '1st Prize · Hacktoberfest Hack Day 2026 · Leash', opens: 'leash' },
      { text: "Finalist · HackIndia '26 · 122 teams · AgentSeal", opens: 'agentseal' },
      { text: 'Infosys STEM Stars Scholarship · 2025 to 2026' },
      { text: 'Google Cloud Certificate · Introduction to Generative AI' },
    ] as { text: string; opens?: string }[],
  },
  openSource: {
    title: 'Open Source',
    items: [
      {
        text: 'arkor · merged PR · port-fallback fix in the arkor dev CLI',
        url: 'https://github.com/arkorlab/fine-tuning/pull/212',
      },
      {
        text: 'HonmaruAI · merged PR · 27 commits · auth and real-time sync',
        url: 'https://github.com/Torutesu/HonmaruAI/pull/10',
      },
    ],
  },
  education: {
    title: 'Education',
    items: [
      {
        years: '2025 to 2029',
        text: 'B.Tech, Computer Science & Engineering · University of Lucknow · CGPA 7.1/10 (first year)',
      },
      { years: '2023 to 2024', text: 'Class XII, CBSE · Dron Public School, Meerut · 90%' },
      { years: '2021 to 2022', text: 'Class X, CBSE · Dron Public School, Meerut · 94.8%' },
    ],
  },
  whoAmI: {
    title: 'Who Am I',
    lines: [
      '2nd year CS student at University of Lucknow',
      "Learned web dev first. Realised I couldn't see myself doing it long term",
      "Got into ML because of the hype, honestly. It stayed. It's the one I'm keeping",
      'Now going deeper into LLMs, fine-tuning and RAG',
      'I once wrote fiction. One story crossed 33K views. Deleted it because I thought nobody in tech would care',
      'Off screen: skincare. A lot of it',
    ],
  },
  numbers: {
    title: 'Numbers',
    items: [
      { value: '100+', label: 'day LeetCode streak' },
      { value: '150+', label: 'DSA problems solved' },
      { value: '34', label: 'legal risk categories my model reads' },
      { value: '1st', label: 'prize at Hacktoberfest Hack Day 2026' },
    ],
  },
  writing: {
    title: 'Writing',
    text: 'Build logs and breakdowns, posted while things are still broken.',
    links: [
      { label: 'X', url: 'https://x.com/KGoswami70' },
      { label: 'Medium', url: 'https://medium.com/@kinjalgoswami682' },
    ],
  },
  contact: {
    title: 'Contact',
    line: 'If this looks like the kind of work you want on your team,',
    email: 'kinjalgoswami682@gmail.com',
  },
}
