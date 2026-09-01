import type { ReactNode } from 'react';
import { IconShield, Tag } from '@/components/ds';

const Frame = ({ children }: { children: ReactNode }) => (
  <div style={{ padding: '28px 24px' }}>{children}</div>
);

const SCALE: { size: number; role: string }[] = [
  { size: 16, role: 'inline' },
  { size: 24, role: 'lijstrij' },
  { size: 32, role: 'kaart' },
  { size: 48, role: 'accent' },
];

const WAARBORGEN = [
  'Audit log per tool call — je ziet achteraf wat er is gebeurd',
  'Menselijke goedkeuring op alles wat naar een klant gaat',
  'Data blijft in je eigen tenant; geen training op jullie documenten',
];

export const Sizes = () => (
  <Frame>
    <div className="row" style={{ gap: 44 }}>
      {SCALE.map(({ size, role }) => (
        <div
          key={size}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
        >
          <div
            style={{
              height: 48,
              display: 'flex',
              alignItems: 'center',
              color: size === 48 ? 'var(--accent)' : 'var(--fg)',
            }}
          >
            <IconShield size={size} />
          </div>
          <div className="mono" style={{ fontSize: 12, color: 'var(--fg-dim)' }}>
            {size}px
          </div>
          <div
            className="mono"
            style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-mute)' }}
          >
            {role}
          </div>
        </div>
      ))}
    </div>
  </Frame>
);

export const InContext = () => (
  <Frame>
    <div className="card" style={{ maxWidth: 700 }}>
      <div className="spread">
        <div className="row" style={{ gap: 12 }}>
          <span style={{ color: 'var(--accent)', display: 'inline-flex' }}>
            <IconShield size={24} aria-hidden />
          </span>
          <h4 style={{ fontSize: 18 }}>Veilige integraties</h4>
        </div>
        <Tag>Governance</Tag>
      </div>
      <p style={{ fontSize: 14, marginTop: 14, color: 'var(--fg-dim)', maxWidth: '54ch' }}>
        Een koppeling met Slack, Exact of je CRM krijgt alleen de rechten die de taak nodig heeft.
        We leggen per integratie vast wie eigenaar is en wanneer een mens ernaar kijkt.
      </p>
      <div className="divider" style={{ margin: '20px 0 16px' }} />
      <div style={{ display: 'grid', gap: 12 }}>
        {WAARBORGEN.map((w) => (
          <div key={w} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ color: 'var(--accent)', display: 'inline-flex', marginTop: 1 }}>
              <IconShield size={16} aria-hidden />
            </span>
            <span style={{ fontSize: 13, color: 'var(--fg-dim)' }}>{w}</span>
          </div>
        ))}
      </div>
    </div>
  </Frame>
);
