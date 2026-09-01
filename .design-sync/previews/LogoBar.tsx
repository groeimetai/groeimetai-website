import type { ReactNode } from 'react';
import { LogoBar, Eyebrow, Section } from '@/components/ds';

const Frame = ({ children }: { children: ReactNode }) => (
  <div style={{ padding: '44px 24px' }}>{children}</div>
);

export const OnderDeHero = () => (
  <Section tight>
    <div style={{ textAlign: 'center' }}>
      <Eyebrow>Eerder gewerkt voor</Eyebrow>
      <div style={{ marginTop: 28 }}>
        <LogoBar logos={['ABN AMRO', 'NS', 'DIM Haarlem', 'NovaSkin']} more="+ en andere" />
      </div>
    </div>
  </Section>
);

export const Standaard = () => (
  <Frame>
    <LogoBar />
  </Frame>
);

export const DrieNamen = () => (
  <Frame>
    <LogoBar logos={['ABN AMRO', 'NS', 'NovaSkin']} more="+ en andere" />
  </Frame>
);
