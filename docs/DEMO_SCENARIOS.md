# GroeimetAI Enhanced Chatbot - Demo Scenarios

## 🚀 Overview

De GroeimetAI chatbot is uitgebreid met geavanceerde agentic AI mogelijkheden. Dit document beschrijft verschillende demo scenario's die de kracht van onze multi-agent oplossing demonstreren.

## 🎯 Core Features

### Real Features (Productie-klaar)
- **Knowledge Base Search** - Doorzoekt GroeimetAI content
- **Web Scraping** - Haalt actuele website informatie op
- **ServiceNow Integration** - Ticket management en queries
- **Meeting Scheduler** - Plant consultaties en demos
- **Email Automation** - Verstuurt follow-up emails
- **Calculator** - ROI en kosten berekeningen
- **Multi-Step Reasoning** - Complexe analyse
- **Document Generator** - Voorstellen en rapporten

### Demo Features (Showcase)
- **Stock Trader** - Portfolio management simulatie
- **Shopping Assistant** - E-commerce met cart management
- **Travel Planner** - Vluchten en hotels boeken
- **Smart Home** - Apparaat controle en automatisering

## 📊 Demo Scenario 1: Stock Trading

### Conversatie Voorbeeld
```
User: "Ik wil graag aandelen kopen van ASML"
Bot: "Ik kan u helpen met het kopen van ASML aandelen via onze demo trading tool. Laat me eerst de huidige marktdata ophalen..."
[Tool: stock_trader -> get_market_data]
Bot: "ASML handelt momenteel op €650.50. Hoeveel aandelen wilt u kopen?"
User: "Koop 10 aandelen"
[Tool: stock_trader -> execute_order]
Bot: "✅ Order uitgevoerd! U heeft 10 ASML aandelen gekocht voor €650.50 per stuk. Totale investering: €6,505.00"
```

### Mogelijke Commando's
- "Toon mijn portfolio"
- "Wat is de koers van NVDA?"
- "Verkoop 5 ASML aandelen"
- "Geef trading aanbevelingen"
- "Voer momentum strategie uit"

## 🛒 Demo Scenario 2: Shopping Assistant

### Conversatie Voorbeeld
```
User: "Ik zoek een nieuwe laptop voor AI development"
Bot: "Ik help u graag met het vinden van de perfecte laptop voor AI development. Laat me onze catalogus doorzoeken..."
[Tool: shopping_assistant -> search_products]
Bot: "Ik heb verschillende krachtige laptops gevonden:
- MacBook Pro M3 Max (€4,999) - Uitstekend voor ML workloads
- Dell XPS 17 met RTX 4090 (€3,799) - Krachtige GPU voor deep learning
Welke wilt u aan uw winkelwagen toevoegen?"
```

### Mogelijke Commando's
- "Zoek AI development tools"
- "Voeg MacBook toe aan winkelwagen"
- "Toon mijn winkelwagen"
- "Plaats bestelling"
- "Track mijn order"

## ✈️ Demo Scenario 3: Travel Planning

### Conversatie Voorbeeld
```
User: "Plan een zakenreis naar San Francisco voor een AI conferentie"
Bot: "Ik help u graag met het plannen van uw zakenreis naar San Francisco. Wanneer wilt u reizen?"
User: "15-20 maart"
[Tool: travel_planner -> search_flights]
[Tool: travel_planner -> search_hotels]
Bot: "Perfecte opties gevonden:
✈️ KLM directe vlucht AMS-SFO: €875
🏨 Hilton Union Square: €265/nacht (dichtbij conferentiecentrum)
Zal ik deze voor u boeken?"
```

### Mogelijke Commando's
- "Zoek vluchten naar New York"
- "Vind hotels in Amsterdam"
- "Maak een reisschema voor Londen"
- "Boek vlucht KL605"
- "Geef reisaanbevelingen voor Parijs"

## 🏠 Demo Scenario 4: Smart Home Control

### Conversatie Voorbeeld
```
User: "Zet alle lichten in de woonkamer aan"
Bot: "Ik zet de verlichting in de woonkamer voor u aan..."
[Tool: smart_home -> control_device]
Bot: "✅ Woonkamer verlichting is nu aan op 75% helderheid. Wilt u de helderheid aanpassen?"
User: "Activeer film kijken modus"
[Tool: smart_home -> set_scene]
Bot: "🎬 Film kijken modus geactiveerd:
- Verlichting gedimd naar 20%
- TV aangezet
- Surround sound geactiveerd
- Gordijnen gesloten"
```

### Mogelijke Commando's
- "Zet de verwarming op 21 graden"
- "Toon energie verbruik"
- "Maak een ochtend routine"
- "Wat is de status van de slaapkamer?"
- "Activeer veiligheidsmodus"

## 🤖 Multi-Tool Scenario's

### Scenario A: Complete Business Automation
```
User: "Help me met het organiseren van een AI workshop voor ons team"
Bot gebruikt meerdere tools:
1. [knowledge_base] - Zoekt workshop content
2. [schedule_meeting] - Plant de workshop
3. [send_email] - Stuurt uitnodigingen
4. [generate_document] - Maakt workshop materiaal
5. [calculator] - Berekent ROI van de training
```

### Scenario B: Investment Analysis
```
User: "Is het slim om nu in AI bedrijven te investeren?"
Bot gebruikt:
1. [multi_step_analysis] - Analyseert markt trends
2. [stock_trader] - Toont AI stock performance
3. [scrape_website] - Haalt laatste AI nieuws op
4. [calculator] - Berekent potentiële returns
5. [generate_document] - Maakt investment rapport
```

## 💡 Tips voor Demonstraties

### Best Practices
1. **Start Simpel** - Begin met één tool demonstratie
2. **Bouw Op** - Combineer meerdere tools voor complexere scenario's
3. **Toon Context** - Bot onthoudt conversatie geschiedenis
4. **Highlight Intelligence** - Toon proactieve suggesties
5. **Mix Nederlands/Engels** - Bot begrijpt beide talen

### Krachtige Vragen om te Stellen
- "Analyseer de ROI van een multi-agent systeem voor ons bedrijf"
- "Plan een complete AI transformatie roadmap"
- "Vergelijk verschillende AI implementatie opties"
- "Maak een voorstel voor ServiceNow AI integratie"
- "Help met het opzetten van een AI pilot project"

## 🔧 Technische Details

### Agent Mode vs Simple Mode
- **Agent Mode**: Gebruikt alle tools, proactief, multi-step reasoning
- **Simple Mode**: Basis Q&A, geen tool gebruik

### Session Management
- Conversaties worden bewaard per sessie
- User preferences worden onthouden
- Context blijft behouden tijdens gesprek

### Tool Visualisatie
- Gebruikte tools worden getoond in de interface
- Real-time status updates tijdens tool executie
- Transparante weergave van agent acties

## 📈 Performance Metrics

- **Response Time**: < 2 seconden voor simpele queries
- **Tool Execution**: 1-3 seconden per tool
- **Context Window**: Tot 10 berichten geschiedenis
- **Concurrent Tools**: Tot 5 tools parallel

## 🚀 Deployment Instructions

### Quick Start
```bash
# Update vector store met actuele content
npm run update-vectors

# Start development server
npm run dev

# Test alle demo tools
npm run test-demos
```

### Environment Variables
```env
OPENAI_API_KEY=your-key
PINECONE_API_KEY=your-key
PINECONE_INDEX=groeimetai-website
REDIS_URL=redis://localhost:6379
```

## 📞 Support

Voor vragen over de demo of technische ondersteuning:
- Email: info@groeimetai.io
- Documentatie: https://groeimetai.com/docs
- GitHub: https://github.com/groeimetai

---

*Deze demo showcases zijn ontworpen om de mogelijkheden van agentic AI te demonstreren. Alle trading, shopping, travel en smart home functies zijn simulaties voor demonstratie doeleinden.*