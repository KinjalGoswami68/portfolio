// The project list for the ring, in ring order (shiftlens is in front on load).
// Every word and link is copied from CONTENT.md. Don't edit copy here without editing CONTENT.md.

export type ProjectLink = {
  label: string // 'Live', 'Live demo', 'Arena', 'Repo', 'GitHub', 'Website', 'PR'
  url: string
}

// a titled list in the detail card ("What it does", "How it works", ...)
export type ProjectSection = {
  title: string
  items: string[]
}

export type Project = {
  id: string // unique, also the URL hash (#leash)
  oldIds?: string[] // old hashes that still open this project (#sentinelai opens shiftlens)
  name: string // shown in the title font (Anton)
  image: string // screenshot file in public/projects/. placeholder is drawn if it's missing
  badge?: string
  panelLine: string
  whatItIs: string
  demo?: string // "The demo"
  video?: { src: string; poster: string; alt: string } // shown under "The demo". poster is a file in public/projects/
  sections?: ProjectSection[] // extra titled lists, shown after "The demo"
  tryIt?: string // "Try it"
  honestLimit?: string // "Honest limit"
  fieldNotes?: string[]
  team?: string
  stack?: string[]
  tags?: string[]
  links: ProjectLink[]
}

export const projects: Project[] = [
  {
    id: 'shiftlens',
    oldIds: ['sentinelai'], // the project used to be called SentinelAI. old links keep working
    name: 'ShiftLens',
    image: 'shiftlens.png',
    badge: 'Formerly SentinelAI',
    panelLine: 'Your chatbot changed and nobody told you.',
    whatItIs:
      "Chatbots don't crash when they get worse. Someone edits a prompt or swaps a model, the answers quietly change, and the team hears about it from users. ShiftLens learns what a bot's normal answers look like, and when they drift it opens one incident and an agent writes up the likely cause with the exact answers that prove it.",
    demo: '82 seconds: an incident, a question to the agent, and the try without code page. The live demo needs no login.',
    video: {
      src: 'https://shiftlens.pages.dev/demo/shiftlens-demo.mp4',
      poster: 'shiftlens-poster.jpg',
      alt: 'ShiftLens incident page showing an investigation note with cited answers',
    },
    sections: [
      {
        title: 'What it does',
        items: [
          'Learns what normal looks like for each bot from its own answers, and says how sure it is before it starts alerting.',
          'Catches drift in meaning, slow decline over time, rising refusals, and bad releases when a new prompt or model version ships.',
          'Groups a bad hour into one incident with at most three Slack messages, instead of one alert per answer.',
          `Runs an investigation agent: it compares the changed answers with normal ones, checks version changes, and writes a short note with the likely cause, a confidence, and the request ids as evidence. Any claim without evidence is dropped. When it can't tell why, it says "unknown, low confidence".`,
          'Lets you ask the agent questions about an incident. Every claim it makes has to cite real answers.',
          'Checks answer quality from the first answer (refusals, off-topic or empty replies), and spot-checks a sample of answers against the source documents the bot used.',
        ],
      },
      {
        title: 'How it works',
        items: [
          "Each answer is embedded on CPU with bge-small-en-v1.5. For every new answer it measures the distance to its 5th nearest neighbour among the bot's normal answers.",
          'A bot only goes live when its alert threshold is stable, instead of after a fixed warm-up.',
          'Two CUSUM trackers catch slow drift and rising refusals. A version check compares answers from a new prompt or model version against the baseline.',
          "Math decides whether there's a problem. The LLM only writes the explanation, and can lower the confidence but never raise it.",
        ],
      },
      {
        title: 'In my test scenarios',
        items: [
          'One round of scripted tests. Every number is on the public scorecard.',
          'Named the right cause in 7 of 8 test scenarios. The miss (a topic shift it called "unknown") is on the scorecard too.',
          '0 of 2 false incidents on normal traffic.',
          'Caught a bad prompt change after 10 answers.',
          'Single normal answers wrongly flagged went from 5 in 60 in the first version to 1 in 60.',
        ],
      },
    ],
    tryIt: "There's a try without code page. Paste answers from before and after a change and get the same investigation.",
    honestLimit:
      "It doesn't detect hallucinations in general. It catches when a bot's behaviour changes, and flags answers its source documents don't support. It's been tested on scripted scenarios and a demo bot, not yet on real production traffic.",
    fieldNotes: [
      'Runs entirely on free tiers. Detection uses no LLM call per answer.',
      'I designed, built and shipped all of it: backend, detection, the agent, the web app and the landing page.',
    ],
    stack: [
      'Python',
      'FastAPI',
      'Supabase Postgres',
      'FastEmbed (bge-small-en-v1.5, ONNX, CPU)',
      'NumPy',
      'Groq (gpt-oss-120b, gpt-oss-20b, qwen3.8-27b)',
      'pydantic',
      'Slack webhooks',
      'Render',
      'GitHub Actions',
      'Cloudflare Pages',
      'Vite',
      'React',
      'TypeScript',
      'Tailwind',
      'GSAP',
      'uPlot',
      'Playwright',
    ],
    tags: ['LLM monitoring', 'Agents', 'Embeddings', 'Anomaly detection', 'FastAPI', 'Postgres', 'React', 'TypeScript'],
    links: [
      { label: 'Live demo', url: 'https://shiftlens.pages.dev/app/demo/' },
      { label: 'GitHub', url: 'https://github.com/KinjalGoswami68/ShiftLens' },
      { label: 'Website', url: 'https://shiftlens.pages.dev' },
    ],
  },
  {
    id: 'leash',
    name: 'Leash',
    image: 'leash.png',
    badge: '1st Prize · Hacktoberfest Hack Day 2026',
    panelLine: "The AI got hacked. The money didn't.",
    whatItIs:
      'A smart-contract vault that holds money for an AI agent. The agent gets a key that can do exactly one thing: pay(). Spending caps, a recipient allowlist and a kill switch live in the contract, so when the agent gets prompt-injected, the damage is capped by code, not by the prompt.',
    demo: 'We hid a "pay this wallet" line inside a vendor email. The model fell for it. The contract blocked it on-chain and logged why.',
    honestLimit:
      'The daily cap uses a fixed 24h window, so worst case is 2x the limit across a window edge. A sliding window would cost more gas.',
    stack: ['Solidity', 'OpenZeppelin', 'Hardhat', 'Base Sepolia', 'Python', 'FastAPI', 'web3.py', 'gpt-oss-120b on Groq', 'Next.js'],
    links: [
      // Live and Arena hidden until leash-agent.vercel.app is redeployed (it returns 404)
      { label: 'Repo', url: 'https://github.com/KinjalGoswami68/leash' },
    ],
  },
  {
    id: 'contract-risk-analyzer',
    name: 'Contract Risk Analyzer',
    image: 'cra.png',
    panelLine: 'Contracts are dense on purpose. This reads them for you.',
    whatItIs:
      'Fine-tuned DistilBERT on CUAD to flag clauses across 34 legal risk categories, then Llama 3.3 70B on Groq explains each one in plain English. Upload a contract, get the risky parts and what they actually commit you to.',
    fieldNotes: [
      'About 75% accuracy across 34 categories, fine-tuned on a free Colab T4',
      'Whole pipeline solo: preprocessing, fine-tuning, prompt design, frontend',
      'The LLM layer exists so non-lawyers can read the output',
    ],
    stack: ['Python', 'Hugging Face Transformers (DistilBERT)', 'Groq (Llama 3.3 70B)', 'Streamlit'],
    links: [
      { label: 'Live', url: 'https://contract-risk-analyzer23.streamlit.app/' },
      { label: 'Repo', url: 'https://github.com/KinjalGoswami68/contract-risk-analyzer' },
    ],
  },
  {
    id: 'orbital-terrain-scanner',
    name: 'Orbital Terrain Scanner',
    image: 'orbital.png',
    panelLine: "Satellite images in. Trees and water out. What's left is what we built.",
    whatItIs:
      'Fine-tuned a pretrained ResNet18 on EuroSAT Sentinel-2 to classify 10 land-cover classes. A rasterio + NumPy pipeline turns raw .tif/.jpg satellite files into tensors. Then a NumPy mask strips out vegetation and water in real time so only exposed ground and infrastructure stay.',
    fieldNotes: [
      'The anomaly filter is matrix masking, not a second model',
      'Fought Git buffer-size and timeout errors to deploy a 43MB model file',
    ],
    stack: ['Python', 'PyTorch (ResNet18)', 'rasterio', 'NumPy', 'Streamlit'],
    // no repo link: the repo is empty
    links: [{ label: 'Live', url: 'https://terrain-web-app.streamlit.app/' }],
  },
  {
    id: 'agentseal',
    name: 'AgentSeal',
    image: 'agentseal.png',
    badge: "HackIndia '26 finalist · 122 teams",
    panelLine: 'Every decision the agent makes gets signed. Nobody edits it later.',
    whatItIs:
      "An AI decision audit and tamper-detection system. Ethereum-style signing, a LangChain/Groq agent and a Solidity contract on the Polygon Amoy testnet, so any decision can be verified later and can't be quietly changed.",
    stack: ['Solidity', 'Polygon Amoy', 'LangChain', 'Groq', 'Ethereum-style signing'],
    links: [], // no repo button
  },
  {
    id: 'honmaruai',
    name: 'HonmaruAI',
    image: 'honmaruai.png',
    badge: 'Merged · 27 commits',
    panelLine: 'The maintainer found holes in my auth code. I fixed every one.',
    whatItIs:
      'Turned the reference web client into a real signed-in client: session-token auth, a browser create/decide flow that reaches the WebSocket relay, and a CORS fix that unblocked every browser API call. Review found authorization gaps (org-membership checks, invite-role validation, identity uniqueness). Fixed each one over multiple rounds and added a test per fix before merge.',
    stack: ['TypeScript', 'Cloudflare Workers', 'WebSockets'],
    links: [{ label: 'PR', url: 'https://github.com/Torutesu/HonmaruAI/pull/10' }],
  },
  {
    id: 'arkor',
    name: 'arkor',
    image: 'arkor.png',
    badge: 'Merged · my first PR',
    panelLine: 'My first merged PR. A port bug, and a lot of review comments.',
    // the backticks are from CONTENT.md (code formatting for the command name)
    whatItIs:
      'Diagnosed and fixed a port-fallback bug in the `arkor dev` CLI. Took it through multiple rounds of maintainer review before it landed in main.',
    links: [{ label: 'PR', url: 'https://github.com/arkorlab/fine-tuning/pull/212' }],
  },
]
