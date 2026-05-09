# Voice & Tone — GroeimetAI website

Bron: `website-repositioning-2026-04.md` (april 2026 herpositionering). Dit document is de praktische gids; bij conflict wint het origineel.

## Kernuitspraak

> "Geen AI-hype. Wel teams die er echt beter door werken."

Elke regel copy moet daar uiteindelijk op terug te leiden zijn. Als een tekst niet past bij die zin: schrijf hem opnieuw.

## Wie we aanspreken

MKB-bedrijven en dienstverlenende organisaties. **Geen developers.** De lezer:

- Heeft AI zien gebeuren en weet dat het belangrijk is
- Heeft geen idee waar te beginnen
- Is sceptisch over hype, beloftes en consultancy-praat
- Wil weten: wat moet ik doen, en hoe weet ik of het werkt?
- Wil controle houden over zijn team, data en proces

## Wat we verkopen

- AI training en workshops
- AI strategie en adoptiebegeleiding
- Workflow redesign met AI
- Veilige AI-integraties
- Implementatie van praktische AI in teams
- Tooling en development — **als tweede stap**, niet als pitch

## Wat we expliciet NIET doen

- Hype verkopen ("revolutionair", "transformatief", "10x", "next-gen")
- Tooljungle aanbieden zonder strategie
- Black-box software die het team afhankelijk maakt
- Beloftes zonder cijfers
- Ons positioneren als "AI implementation partner" of "agent platform"

## Schrijfregels

### Doen

1. **Begin bij het probleem van de lezer**, niet bij wat wij kunnen.
2. **Concrete voorbeelden boven abstracties.** "Een marketingteam van 6 personen leerde in 4 sessies hun campagnes 40% sneller te draaien met Claude" > "Wij verhogen efficiency met AI".
3. **Eerlijk over beperkingen.** "AI kan dit nog niet" is sterker dan "AI kan alles".
4. **Empowerment-frames.** "Wij leren je team X" / "Jullie kunnen straks zelf X". Nooit "Wij doen X voor je" zonder uitleg waarom.
5. **Korte zinnen.** Minder bijzinnen. Punt. Volgende zin.
6. **Nederlandse default**, ook in commits en PR's. Engels alleen als de context het vereist (technische termen, code).
7. **Gebruik "je", niet "u".** Direct, niet stijf.

### Niet doen

1. **Geen buzzwords.** Vermijd: "agents", "agentic", "MCP", "voice AI", "RAG", "embeddings", "agent-ready", "next-gen", "AI-first" als marketing-termen. Mogen voorkomen als technische bewijslast diep in een pagina, niet in een hero of tagline.
2. **Geen lege intensifiers.** "Echt", "absoluut", "compleet", "volledig" — schrap ze.
3. **Geen schaalclaims zonder bron.** "10.000 bedrijven", "miljoenen tokens" — alleen als we het kunnen aantonen, en zelfs dan: meestal weglaten.
4. **Geen "wij zijn de specialist".** Toon het, vertel het niet.
5. **Geen Engelse marketingclichés** in NL copy. Vermijd "leverage", "unlock", "empower" (in NL: "ontketen", "benut" — die voelen ook hol).

## Toon per pagina-type

### Hero / homepage
Direct, concreet, leesbaar in één blik. Geen vage beloftes. Eén heldere actie.

### Service-pagina's
Probleem → wat we doen → hoe we werken → wat het oplevert → wat het kost (richting). Geen feature-bullets zonder context.

### About / over ons
Persoonlijk, eerlijk over wat ons drijft en wat we niet zijn. Niels schrijft als zichzelf, geen "wij bij GroeimetAI".

### Blog / resources
Educatief, geen pitch. Liever één scherp artikel dan tien generieke. Codevoorbeelden mogen, maar leg uit waarom de lezer dit moet weten.

### Microcopy (knoppen, error messages, form labels)
Mensentaal. "Stuur" > "Verzenden". "Werkt niet, probeer opnieuw" > "Er is een fout opgetreden".

## Bilingual (nl/en)

- Beide talen worden onderhouden in `src/translations/{nl,en}.json`
- Engelse copy is **vertaling van de Nederlandse positionering**, geen losse strategie
- Engels mag iets formeler dan Nederlands (typisch voor B2B)
- Houd dezelfde key-structuur — een nieuwe key in `nl.json` betekent dezelfde key in `en.json` (ook al is de waarde tijdelijk een placeholder)

## Quality check vóór je copy laat zien

- [ ] Past de tekst bij "geen AI-hype, wel teams die er beter door werken"?
- [ ] Staat er geen oude positioneringstaal in (agent, MCP, voice AI, AI implementation partner)?
- [ ] Klopt de spelling? (Nederlands èn Engels)
- [ ] Gebruikt het "je" in plaats van "u"?
- [ ] Begint het bij het probleem van de lezer, niet bij wat wij kunnen?
- [ ] Geen lege intensifiers of marketingclichés?

Als één checkbox niet kan: herschrijf voordat je het toont.
