# Recente cases

Niet de glanzende slide-versie. De eerlijke: agents die Niels recent gebouwd heeft. Voor elk project — klantwerk én eigen tooling — bouwt hij in dezelfde stijl: een folder met instructies en lokale tools.

## Case 01 — Social media agent met Telegram approval (eigen tooling)

Eén folder die ideeën, drafts en publicaties beheert voor drie merken: Niels van der Werf (persoonlijk), GroeimetAI (bedrijf), Snow-Flow (open-core). Slash commands voor `/idea`, `/draft`, `/publish`. Optionele headless flow met Telegram approval-stap.

Stack: Claude Code, MCP servers, Telegram, LinkedIn.

Waarom: geen dashboard, geen abonnement. Een folder met instructies + slash commands die handmatig of autonoom kunnen draaien — afhankelijk van hoeveel je wil afgeven.

## Case 02 — BTW-aangifte agent met localhost dashboard (eigen tooling)

Lokale agent voor BTW-kwartaalaangiftes. Haalt transacties uit bunq en Mollie, classificeert elke regel (zakelijk / gemengd / privé) met voorstel en reden, biedt een localhost Python-dashboard om interactief bij te schaven. Leert van correcties per kwartaal.

Stack: bunq MCP, Mollie MCP, Python localhost, xlsx-export.

Waarom: boekhouden hoort lokaal en uitlegbaar. De agent doet het werk, Niels keurt op regelniveau. Geen SaaS die je creditcard wil bij elke nieuwe heuristiek.

## Case 03 — Wekelijkse timesheet-agent (eigen ops)

Leest commits uit GitHub-org `groeimetai` + Google Calendar, past session-inferentie toe op coding-gaps, mergt met handmatige toevoegingen, schrijft per ISO-week een markdown-ledger. Draait elke vrijdag 17:00 via launchd. CSV-export voor de accountant.

Stack: GitHub MCP, Google Calendar MCP, launchd, Markdown + CSV.

Waarom: de Belastingdienst vraagt aantoonbare uren voor het urencriterium (≥1225/jaar). Een agent die wekelijks de bestaande systemen leest doet dat beter dan een Excel die niemand bijhoudt.

## Case 04 — Dagelijkse marktanalyse via TradingView MCP (eigen tooling / experiment)

Leest live charts uit TradingView Desktop via een lokale MCP server (78 tools), scant 12 assets per dag (crypto, indices, AI stocks, consultancy-relevant), levert bias + key levels + signaal-of-wait + risk plan. Pure analyse, geen orders.

Stack: TradingView MCP, Claude, Markdown journal.

Waarom: beslissingsondersteuning hoort lokaal en transparant. Elke analyse is een markdown-bestand dat je later kan teruglezen. Geen black box, geen broker-API.

## Patroon

Wat opvalt: voor elk project — klantwerk én eigen werk — gebruikt Niels hetzelfde patroon. Folder + CLAUDE.md + knowledge/ + .claude/commands/ + mcp-servers/. Dat maakt het patroon zelf onderwijsbaar — wat je in de trainingen leert is exact hoe deze agents in elkaar zitten.

ServiceNow-werk (bv. AI classification widgets voor Service Portal) heeft Niels ook gedaan, maar dat zat in een vorige werkgever-rol — de code daarvan is niet de zijne om publiek te delen. Voor nieuwe ServiceNow-implementaties bouwen we volgens hetzelfde patroon.

Voor het volledige overzicht: `/cases` op de site.
