// The project list. The 3D ring draws one panel per entry, in this order.
// Only verified facts go here. Anything missing is marked 'TODO'.

export type Project = {
  id: string // short unique name, used by React as a key
  title: string
  // screenshot file name inside public/projects/ (about 800px wide).
  // leave it out and the panel shows a colored placeholder with the title.
  image?: string
  badge?: string // award or result, if any
  oneLiner: string
  details?: string[] // extra facts for the detail view (part H)
  stack?: string[]
  whatBroke?: string
  link: string // 'TODO' until the real link is known
}

export const projects: Project[] = [
  {
    id: 'leash',
    title: 'leash',
    badge: 'Hacktoberfest winner (team project)',
    oneLiner: 'A smart-contract vault that holds money for an AI agent.',
    details: ['Caps, recipient allowlist and kill switch live in the contract, not the prompt.'],
    stack: ['Solidity', 'Hardhat', 'Base Sepolia', 'Python', 'FastAPI', 'gpt-oss-120b on Groq', 'Next.js'],
    link: 'https://github.com/KinjalGoswami68/leash',
  },
  {
    id: 'sentinelai',
    title: 'SentinelAI',
    oneLiner: 'Watches LLM outputs and pings Slack when quality drifts.',
    stack: ['FastAPI', 'Supabase Postgres', 'TF-IDF', 'Isolation Forest + CUSUM', 'Slack webhooks', 'Render'],
    whatBroke: 'Render deploy is down, TF-IDF too generic.',
    link: 'TODO', // repo link missing
  },
  {
    id: 'contract-risk-analyzer',
    title: 'Contract Risk Analyzer',
    oneLiner: 'DistilBERT fine-tuned on CUAD, about 75% accuracy across 34 clause categories.',
    details: ['Trained on a free Colab T4.', 'Explanations from Groq Llama 3.3 70B.'],
    stack: ['DistilBERT', 'CUAD', 'Groq Llama 3.3 70B', 'Streamlit'],
    link: 'TODO', // repo link missing
  },
  {
    id: 'agentseal',
    title: 'AgentSeal',
    badge: "HackIndia '26 finalist (122 teams), team infinity loop",
    oneLiner: 'AI decision audit and tamper detection.',
    stack: ['Ethereum-style signing', 'LangChain', 'Groq', 'Solidity', 'Polygon Amoy testnet'],
    link: 'TODO', // repo link missing
  },
  {
    id: 'honmaruai-pr-10',
    title: 'HonmaruAI PR #10',
    badge: 'Merged, 27 commits',
    oneLiner: 'Session-token auth and a browser create/decide flow to the WebSocket relay.',
    details: ['CORS fix.', 'Fixed authorization gaps found in review.'],
    link: 'https://github.com/Torutesu/HonmaruAI/pull/10',
  },
  {
    id: 'arkor-pr',
    title: 'arkor PR',
    badge: 'Merged',
    oneLiner: 'Port-fallback fix in the arkor dev CLI.',
    link: 'TODO', // link not verified yet
  },
]
