import type { ReactNode } from 'react';
import { PillarCard } from '@/components/ds';

const Frame = ({ children }: { children: ReactNode }) => (
  <div style={{ padding: '28px 24px' }}>{children}</div>
);

export const ThreePillars = () => (
  <Frame>
    <div className="ds-grid-3">
      <PillarCard
        tag="01 / FOLDERS"
        title="Kennis als folderstructuur"
        desc="Geen vage prompts. Een agent weet wat hij weet doordat zijn kennis netjes in mappen staat."
        items={['Documenten geordend per domein', 'Klantcontext apart van product', 'Versie-controle in je repo']}
      />
      <PillarCard
        tag="02 / INSTRUCTIES"
        title="Een korte, scherpe rolomschrijving"
        desc="Wat mag de agent wel, wat niet, en in welke toon? Eén bestand. Iedereen leesbaar."
        items={['Doel + grenzen', 'Toon en stijl', 'Wanneer terug naar mens']}
      />
      <PillarCard
        tag="03 / TOOLS"
        title="Concrete acties die hij kan uitvoeren"
        desc="API's, scripts en zoekopdrachten — gedefinieerd, gedocumenteerd, en niet meer dan nodig."
        items={['Read- en write-grenzen', 'Audit log per call', 'Tools toevoegen wanneer nodig']}
      />
    </div>
  </Frame>
);

export const Single = () => (
  <Frame>
    <div style={{ maxWidth: 400 }}>
      <PillarCard
        tag="02 / ADOPTIE"
        title="Van pilot naar dagelijks gebruik"
        desc="De meeste AI-trajecten stranden na de pilot. Wij begeleiden het team tot het gebruik blijft hangen."
        items={['Wekelijkse werksessies', 'Eigen use cases eerst', 'Meetbaar gebruik na 8 weken']}
      />
    </div>
  </Frame>
);
