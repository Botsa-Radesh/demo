# VoiceCart — Voice-Powered Group Shopping

## 🚀 Quick Start

```bash
npm install
npm run seed    # Creates the shared DynamoDB table (one-time)
npm run dev     # Start the app
```

## 🔐 Environment Setup

Credentials are shared via `.env` (committed to repo) — everyone connects to the same AWS DynamoDB + Gemini API.

| File | Committed? | Purpose |
|------|-----------|---------|
| `.env` | ✅ Yes | Shared team credentials (AWS + Gemini) |
| `.env.local` | ❌ No | Local overrides (optional, per developer) |
| `.env.example` | ✅ Yes | Template showing all required vars |

To override the shared config (e.g., use your own API key), add the var to `.env.local`.

## ☁️ AWS Database

The app uses **DynamoDB** (single-table design) in `ap-south-1` (Mumbai).

- **Table:** `VoiceCart`
- **API routes:** `src/app/api/*` — all read/write to DynamoDB
- **Seed script:** `npm run seed` creates the table (safe to re-run if it exists)

To view the database: [AWS Console → DynamoDB](https://ap-south-1.console.aws.amazon.com/dynamodb/home?region=ap-south-1#tables:selected=VoiceCart)

## 🛠 Tech Stack

- **Next.js 16** (App Router)
- **AWS DynamoDB** via `@aws-sdk/lib-dynamodb`
- **Google Gemini 2.0 Flash** for voice parsing + cart analysis + dashboard insights
- **localStorage** for client-side state (synced to DynamoDB via API)
