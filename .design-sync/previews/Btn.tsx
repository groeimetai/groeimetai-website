import type { ReactNode } from 'react';
import { Btn, IconArrow, IconMail, Section } from '@/components/ds';

const Frame = ({ children }: { children: ReactNode }) => (
  <div style={{ padding: '28px 24px' }}>{children}</div>
);

export const Variants = () => (
  <Frame>
    <div className="row" style={{ gap: 12, flexWrap: 'wrap' }}>
      <Btn variant="primary">Plan een kennismaking</Btn>
      <Btn variant="ghost">Bekijk de trainingen</Btn>
    </div>
  </Frame>
);

export const WithIcon = () => (
  <Frame>
    <div className="row" style={{ gap: 12, flexWrap: 'wrap' }}>
      <Btn variant="primary">
        Start een traject <IconArrow size={14} />
      </Btn>
      <Btn variant="ghost">
        <IconMail size={14} /> Mail ons
      </Btn>
    </div>
  </Frame>
);

export const AsLink = () => (
  <Frame>
    <div className="row" style={{ gap: 12, flexWrap: 'wrap' }}>
      <Btn href="/contact">
        Naar contact <IconArrow size={14} />
      </Btn>
      <Btn href="https://groeimetai.io" variant="ghost">
        groeimetai.io
      </Btn>
    </div>
  </Frame>
);

export const OnLightSection = () => (
  <Section light tight>
    <div className="row" style={{ gap: 12, flexWrap: 'wrap' }}>
      <Btn variant="primary">Plan een kennismaking</Btn>
      <Btn variant="ghost">Bekijk de trainingen</Btn>
    </div>
  </Section>
);

export const Disabled = () => (
  <Frame>
    <div className="row" style={{ gap: 12, flexWrap: 'wrap' }}>
      <Btn variant="primary" disabled>
        Versturen…
      </Btn>
      <Btn variant="ghost" disabled>
        Annuleren
      </Btn>
    </div>
  </Frame>
);
