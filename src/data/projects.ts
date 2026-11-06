// The project list for the ring, in ring order (leash is in front on load).
// Every word and link is copied from CONTENT.md. Don't edit copy here without editing CONTENT.md.
// 'TODO' = not given yet. It must stay visible on the site until it's filled in.

export type ProjectLink = {
  label: string // 'live', 'arena', 'repo', 'pr'
  url: string // 'TODO' if missing
}

export type Project = {
  id: string // unique, also used later for the URL hash (#leash)
  name: string // shown in calligraphy
  image: string // screenshot file in public/projects/. placeholder is drawn if it's missing
  badge?: string
  panelLine: string
  whatItIs: string
  demo?: string // "the demo"
  tryIt?: string // "try it"
  honestLimit?: string // "honest limit"
  fieldNotes?: string[]
  team?: string
  stack?: string[]
  links: ProjectLink[]
}

export const projects: Project[] = [
  {
    id: 'leash',
    name: 'leash',
    image: 'leash.png',
    badge: '1st prize · hacktoberfest hack day 2026',
    panelLine: "the ai got hacked. the money didn't.",
    whatItIs:
      'a smart-contract vault that holds money for an ai agent. the agent gets a key that can do exactly one thing: pay(). spending caps, a recipient allowlist and a kill switch live in the contract, so when the agent gets prompt-injected, the damage is capped by code, not by the prompt.',
    demo: 'we hid a "pay this wallet" line inside a vendor email. the model fell for it. the contract blocked it on-chain and logged why.',
    tryIt:
      "there's a jailbreak arena. three vaults, same agent, different rules. fool the agent and see which vault still says no.",
    honestLimit:
      'the daily cap uses a fixed 24h window, so worst case is 2x the limit across a window edge. a sliding window would cost more gas.',
    team: 'team cryptonix with khushi kushwaha, ambar gupta and chhavi gupta. faculty of engineering and technology, university of lucknow',
    stack: ['Solidity', 'OpenZeppelin', 'Hardhat', 'Base Sepolia', 'Python', 'FastAPI', 'web3.py', 'gpt-oss-120b on Groq', 'Next.js'],
    links: [
      { label: 'live', url: 'https://leash-agent.vercel.app' },
      { label: 'arena', url: 'https://leash-agent.vercel.app/arena' },
      { label: 'repo', url: 'https://github.com/KinjalGoswami68/leash' },
    ],
  },
  {
    id: 'sentinelai',
    name: 'SentinelAI',
    image: 'sentinelai.png',
    panelLine: 'llms go bad quietly. this one tells slack within 60 seconds.',
    whatItIs: `watches what a chatbot actually says after it's live. three signals catch what one metric would miss: tf-idf cosine similarity for drift, isolation forest for anomalies, cusum for slow decay. multi-tenant fastapi backend that learns each tenant's "normal" from live usage instead of hardcoding it.`,
    fieldNotes: [
      "picked tf-idf over sentence-transformers because render's free tier gives 512mb ram",
      'added a 50-sample warmup after false positives spiked on cold start',
      'did the whole thing solo: architecture, ml pipeline, backend, deploy, ui',
    ],
    stack: ['Python', 'FastAPI', 'scikit-learn', 'Streamlit', 'Supabase Postgres', 'Render', 'Slack webhooks'],
    links: [
      { label: 'live', url: 'https://sentinelai24455.streamlit.app' },
      { label: 'repo', url: 'TODO' },
    ],
  },
  {
    id: 'contract-risk-analyzer',
    name: 'Contract Risk Analyzer',
    image: 'cra.png',
    panelLine: 'contracts are dense on purpose. this reads them for you.',
    whatItIs:
      'fine-tuned distilbert on CUAD to flag clauses across 34 legal risk categories, then llama 3.3 70b on groq explains each one in plain english. upload a contract, get the risky parts and what they actually commit you to.',
    fieldNotes: [
      'about 75% accuracy across 34 categories, fine-tuned on a free colab t4',
      'whole pipeline solo: preprocessing, fine-tuning, prompt design, frontend',
      'the llm layer exists so non-lawyers can read the output',
    ],
    stack: ['Python', 'Hugging Face Transformers (DistilBERT)', 'Groq (Llama 3.3 70B)', 'Streamlit'],
    links: [
      { label: 'live', url: 'https://contract-risk-analyzer23.streamlit.app/' },
      { label: 'repo', url: 'TODO' },
    ],
  },
  {
    id: 'orbital-terrain-scanner',
    name: 'Orbital Terrain Scanner',
    image: 'orbital.png',
    panelLine: "satellite images in. trees and water out. what's left is what we built.",
    whatItIs:
      'fine-tuned a pretrained resnet18 on eurosat sentinel-2 to classify 10 land-cover classes. a rasterio + numpy pipeline turns raw .tif/.jpg satellite files into tensors. then a numpy mask strips out vegetation and water in real time so only exposed ground and infrastructure stay.',
    fieldNotes: [
      'the anomaly filter is matrix masking, not a second model',
      'fought git buffer-size and timeout errors to deploy a 43mb model file',
    ],
    stack: ['Python', 'PyTorch (ResNet18)', 'rasterio', 'NumPy', 'Streamlit'],
    links: [
      { label: 'live', url: 'https://terrain-web-app.streamlit.app/' },
      { label: 'repo', url: 'TODO' },
    ],
  },
  {
    id: 'agentseal',
    name: 'AgentSeal',
    image: 'agentseal.png',
    badge: "hackindia '26 finalist · 122 teams",
    panelLine: 'every decision the agent makes gets signed. nobody edits it later.',
    whatItIs:
      "an ai decision audit and tamper-detection system. ethereum-style signing, a langchain/groq agent and a solidity contract on the polygon amoy testnet, so any decision can be verified later and can't be quietly changed.",
    team: 'team infinity loop',
    stack: ['Solidity', 'Polygon Amoy', 'LangChain', 'Groq', 'Ethereum-style signing'],
    links: [{ label: 'repo', url: 'TODO' }],
  },
  {
    id: 'honmaruai',
    name: 'HonmaruAI',
    image: 'honmaruai.png',
    badge: 'merged · 27 commits',
    panelLine: 'the maintainer found holes in my auth code. i fixed every one.',
    whatItIs:
      'turned the reference web client into a real signed-in client: session-token auth, a browser create/decide flow that reaches the websocket relay, and a cors fix that unblocked every browser api call. review found authorization gaps (org-membership checks, invite-role validation, identity uniqueness). fixed each one over multiple rounds and added a test per fix before merge.',
    stack: ['TypeScript', 'Cloudflare Workers', 'WebSockets'],
    links: [{ label: 'pr', url: 'https://github.com/Torutesu/HonmaruAI/pull/10' }],
  },
  {
    id: 'arkor',
    name: 'arkor',
    image: 'arkor.png',
    badge: 'merged · my first pr',
    panelLine: 'my first merged pr. a port bug, and a lot of review comments.',
    // the backticks are from CONTENT.md (code formatting for the command name)
    whatItIs:
      'diagnosed and fixed a port-fallback bug in the `arkor dev` cli. took it through multiple rounds of maintainer review before it landed in main.',
    // TODO: the old site links issue #199, the actual pr link is still needed
    links: [{ label: 'pr', url: 'TODO' }],
  },
]
