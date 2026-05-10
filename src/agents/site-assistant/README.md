# site-assistant

The chatbot that runs on the GroeimetAI website. It is itself an example of the agent pattern we teach: one folder containing instructions, knowledge and tools.

## Structure

```
site-assistant/
├── CLAUDE.md             # system prompt + behavior rules
├── knowledge/            # what the agent knows (markdown only)
│   ├── index.md          # table of contents
│   ├── trainingen.md
│   ├── agents.md
│   ├── cases.md
│   ├── about-niels.md
│   ├── serac-oss.md
│   ├── contact.md
│   ├── faq.md
│   ├── pricing.md
│   └── anatomy.md
└── .claude/commands/
    └── plan-gesprek.md
```

## How the runtime uses these files

- `src/lib/agent/core.ts` reads `CLAUDE.md` as the system prompt.
- The agent has tools `listKnowledge()` and `readKnowledge(path)` defined in
  `src/lib/agent/tools/knowledge.ts`, which read these markdown files at
  request time.
- Authenticated admin sessions get extra Firestore tools (`getProjects`,
  `getAssessment`).
- No Pinecone / vector DB — the assistant looks things up by reading files,
  same way Claude Code reads source files.

## Editing

To change tone, behavior or routing rules: edit `CLAUDE.md`.
To add or update facts: edit a markdown file in `knowledge/`. Mention the new
file in `knowledge/index.md` so the agent knows to look for it.
No code changes required for content updates.
