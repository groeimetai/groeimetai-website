import type { ReactNode } from 'react';
import { DsLink, Eyebrow, Section } from '@/components/ds';

const Frame = ({ children }: { children: ReactNode }) => (
  <div style={{ padding: '28px 24px' }}>{children}</div>
);

export const Default = () => (
  <Frame>
    <DsLink href="/trainingen">Bekijk de trainingen</DsLink>
  </Frame>
);

export const HrefTargets = () => (
  <Frame>
    <div style={{ display: 'grid', gap: 20, justifyItems: 'start' }}>
      <DsLink href="/cases">Alle cases bekijken</DsLink>
      <DsLink href="https://github.com/serac-labs/serac">Bekijk Serac op GitHub</DsLink>
      <DsLink onClick={() => undefined}>Lees de volledige aanpak</DsLink>
    </div>
  </Frame>
);

export const InSectionHead = () => (
  <Section id="cases-preview">
    <div className="sec-head">
      <div>
        <Eyebrow>Recent werk</Eyebrow>
        <h2 style={{ marginTop: 16 }}>Waar teams mee begonnen zijn</h2>
      </div>
      <div className="sec-head-right">
        <DsLink href="/cases">Alle cases bekijken</DsLink>
      </div>
    </div>
    <p className="lead">
      Drie trajecten uit het afgelopen jaar, met wat er daadwerkelijk veranderde in het werk van
      de mensen die er dagelijks mee zitten.
    </p>
  </Section>
);

export const InCardFooter = () => (
  <Frame>
    <div className="card" style={{ maxWidth: 460 }}>
      <div
        className="mono"
        style={{ fontSize: 11, letterSpacing: '0.08em', color: 'var(--fg-mute)' }}
      >
        02 / STRATEGISCH
      </div>
      <h3 style={{ marginTop: 14 }}>AI Literacy voor management</h3>
      <p style={{ marginTop: 12, fontSize: 15 }}>
        Halve dag met directie en L&amp;D. We maken scherp wat AI wél en niet kan, en welke
        beslissingen alleen jullie kunnen nemen.
      </p>
      <div style={{ marginTop: 24 }}>
        <DsLink href="/trainingen">Meer weten over deze training</DsLink>
      </div>
    </div>
  </Frame>
);

export const OnLightSection = () => (
  <Section light tight>
    <Eyebrow>Werkwijze</Eyebrow>
    <h2 style={{ marginTop: 16, maxWidth: '22ch' }}>Eerst het werk, dan de tool</h2>
    <p className="lead" style={{ marginTop: 20 }}>
      We beginnen bij de taken die je team elke week herhaalt. Pas als duidelijk is waar de tijd
      blijft, kijken we welke stap AI kan overnemen.
    </p>
    <div style={{ marginTop: 28 }}>
      <DsLink href="/aanpak">Zo pakken we een traject aan</DsLink>
    </div>
  </Section>
);
