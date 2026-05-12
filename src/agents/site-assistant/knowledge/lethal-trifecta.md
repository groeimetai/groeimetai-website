# De "lethal trifecta" (security)

Een term geïntroduceerd door Simon Willison. Een agent met **alle drie** deze eigenschappen tegelijk is een prompt-injectie doelwit:

1. **Toegang tot privédata** — documenten, klantenlijst, CRM, mail-threads, etc.
2. **Blootstelling aan onvertrouwde input** — webpages, klant-uploads, e-mails van derden, scraped content.
3. **Externe uitvoeractie** — mail versturen, API calls maken, posts plaatsen.

Op zichzelf is elk van deze drie prima. Het wordt gevaarlijk als ze gecombineerd worden in dezelfde agent-run: een aanvaller verstopt instructies in (2), de agent leest (1), en exfiltreert die data via (3).

## Hoe wij dit voorkomen

Wij ontwerpen elke agent expliciet zodat **minstens één van de drie ontbreekt**, of dat er een mens-in-the-loop tussen zit op het gevaarlijke moment. Concrete maatregelen:

- **Gescheiden capabilities.** Een agent die externe content leest heeft geen send-mail tool. Een agent met send-mail leest alleen interne (vertrouwde) data.
- **Audit log per tool-call.** Elke tool-invocatie is reviewbaar achteraf.
- **Menselijke approval op de gevaarlijke stappen.** Voorbeelden: voor we een betaling doen of een klantmail versturen wacht de agent op een Telegram/UI-approval.
- **Tool-permissions per scope.** Een tool die naar buiten gaat is read-only of write-binnen-grens (rate limited, met whitelist).

## Hoe dit terugkomt op de site

Op `/agents` staat hier een aparte sectie over. Het is een goede entry voor klanten met security/compliance vragen — laat ze weten dat we het concept kennen en operationeel aanpakken.

## Wanneer doorverwijzen

Als iemand specifiek vraagt naar prompt-injectie, data-exfiltratie, security-architectuur of "hoe garanderen jullie dat de agent niet hacked wordt": noem de lethal trifecta-aanpak en verwijs naar `/agents` voor de uitleg. Voor een diepgaand gesprek: plan via `/contact`.

## Bron

Simon Willison schrijft hierover op simonwillison.net. De term werd populair in 2024-2025 in de agent-security community.
