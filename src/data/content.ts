// Site copy outside the ring. Every word and link is copied from CONTENT.md.
// 'TODO' = not given yet. It stays visible on the site until it's filled in.

export const intro = {
  smallLine: "hi, i'm",
  name: 'KINJAL GOSWAMI',
  line: 'ml engineer. 2nd year cs at university of lucknow. ai data acquisition intern at dataflirt.',
  facts: [
    'won 1st prize at hacktoberfest hack day 2026 with leash',
    'i build ml systems end to end, then write about what broke',
    'right now: llms, fine-tuning and rag',
    'i write fiction too. one story crossed 33k views',
    'off screen: TODO (my hobbies)',
  ],
  button: 'enter',
}

export const hero = {
  badge: '1st prize · hacktoberfest hack day 2026',
  backLink: 'back to intro',
}

export type SocialLink = {
  label: string
  url: string
  external: boolean // true = opens in a new tab
  todo?: string // set = the link doesn't work yet, show this TODO instead of a link
}

// links from the contact section of CONTENT.md, in the intro's order
export const socialLinks: SocialLink[] = [
  { label: 'github', url: 'https://github.com/KinjalGoswami68', external: true },
  { label: 'linkedin', url: 'https://linkedin.com/in/kinjal-goswami-03738a376', external: true },
  { label: 'x', url: 'https://x.com/KGoswami70', external: true },
  { label: 'medium', url: 'https://medium.com/@kinjalgoswami682', external: true },
  { label: 'email', url: 'mailto:kinjalgoswami682@gmail.com', external: false },
  {
    label: 'resume',
    url: `${import.meta.env.BASE_URL}resume/Kinjal_Resume.pdf`,
    external: false,
    // remove this line once the pdf is in public/resume/
    todo: 'TODO: copy the pdf into public/resume/',
  },
]
