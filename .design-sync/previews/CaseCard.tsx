import type { ReactNode } from 'react';
import { CaseCard, DsLink, Eyebrow, Section } from '@/components/ds';

const Frame = ({ children }: { children: ReactNode }) => (
  <div style={{ padding: '28px 24px' }}>{children}</div>
);

export const ThreeUp = () => (
  <Frame>
    <div className="ds-grid-3">
      <CaseCard
        industry="ServiceNow · Klantwerk"
        title="AI-classificatie voor het Service Portal"
        snippet="Een widget die binnenkomende requests zelf classificeert, live status toont en het juiste KB-artikel erbij zoekt."
        metric={{ num: 'Multi', label: 'klant-implementaties' }}
      />
      <CaseCard
        industry="Persoonlijke branding"
        title="Social media agent met Telegram-approval"
        snippet="Eén folder die idee, concept en publicatie beheert voor drie merken. Publiceren pas na akkoord in Telegram."
        metric={{ num: '3', label: 'merken in één agent' }}
      />
      <CaseCard
        industry="Finance · ZZP"
        title="BTW-aangifte met lokaal dashboard"
        snippet="Haalt transacties op, classificeert elke regel met een reden, en laat je op regelniveau bijsturen."
        metric={{ num: '1 uur', label: 'per kwartaal, was een dag' }}
      />
    </div>
  </Frame>
);

export const Single = () => (
  <Frame>
    <div style={{ maxWidth: 400, margin: '0 auto' }}>
      <CaseCard
        industry="Eigen ops · GroeimetAI"
        title="Wekelijkse timesheet-agent"
        snippet="Leest commits en agenda, leidt werksessies af uit de gaten daartussen, en schrijft elke vrijdag een urenregel per project."
        metric={{ num: '1.225', label: 'uren automatisch geregistreerd' }}
      />
    </div>
  </Frame>
);

export const OnLightSection = () => (
  <Section light tight>
    <div className="sec-head">
      <div>
        <Eyebrow>Recent werk</Eyebrow>
        <h2 style={{ marginTop: 16 }}>Agents die we zelf bouwen</h2>
      </div>
      <div className="sec-head-right">
        <DsLink href="/cases">Alle cases bekijken</DsLink>
      </div>
    </div>
    <div className="ds-grid-3">
      <CaseCard
        industry="Zorg · Ambulant team"
        title="Rapportages nakijken in plaats van typen"
        snippet="De agent maakt het concept uit de losse aantekeningen, de behandelaar controleert en tekent af."
        metric={{ num: '−40%', label: 'administratietijd per dienst' }}
      />
      <CaseCard
        industry="Financieel · Mkb"
        title="Offerte-review langs vaste regels"
        snippet="Elke offerte langs dezelfde controles voor die de deur uitgaat. Twijfelgevallen gaan naar een mens."
        metric={{ num: '20 min', label: 'doorlooptijd, was 2 dagen' }}
      />
      <CaseCard
        industry="Techniek · Service desk"
        title="Tier-1 vragen met een audit log"
        snippet="Standaardvragen direct beantwoord, escalaties mét context naar de juiste collega."
        metric={{ num: '78%', label: 'in één keer afgehandeld' }}
      />
    </div>
  </Section>
);
