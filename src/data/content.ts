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
    'I also wrote fiction story that crossed 33K views',
  ],
  button: 'Enter',
}

export const hero = {
  badge: '1st Prize · Hacktoberfest Hack Day 2026',
  backLink: 'Back to intro',
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
  missing: 'TODO: copy the pdf into public/resume/', // shown while the pdf doesn't exist
}
