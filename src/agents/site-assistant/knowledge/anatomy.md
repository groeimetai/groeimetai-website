# Anatomie van een agent

Een agent is geen magie en geen SaaS-product. Het is een mappenstructuur met drie ingrediënten:

## 1. Folders — wat de agent weet

Eén folder met markdown- en JSON-bestanden. Documentatie, beleid, voorbeelden, tone of voice. Versioneerbaar in git, te bewerken door iedereen.

```
knowledge/*.md, *.json
```

Geen vage trainingsdata — concrete bestanden die jij beheert.

## 2. Instructies — hoe de agent denkt

Eén leesbaar document (bijvoorbeeld `CLAUDE.md`). Doelen, regels, edge cases en escalatiepaden. Geen YAML-spaghetti, geen flowchart van 47 stappen. Leesbaar voor mensen, uitvoerbaar door het model.

## 3. Tools — wat de agent kan

Concrete acties: een mail sturen, een factuur opzoeken, een afspraak boeken. Lokale MCP-servers per service, met permissions, audit log en menselijke review waar nodig.

```
mcp-servers/<service>/server.py
```

Niets meer dan jij toestaat.

## Waarom dit patroon

- **Geen black box.** Je kan elk bestand openen, lezen en aanpassen.
- **Geen vendor lock-in.** Markdown en lokale code; werkt op elke harness die files leest en tools aanroept.
- **Eigen team is de bouwer.** Wie de drie bouwstenen snapt kan zelf agents bouwen, debuggen en uitbreiden.

Pagina's: `/agents` voor implementatie, `/trainingen` voor leren bouwen.
