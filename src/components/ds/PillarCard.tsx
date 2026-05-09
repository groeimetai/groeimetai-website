import { IconArrow } from './icons';

export function PillarCard({
  tag,
  title,
  desc,
  items,
  onClick,
}: {
  tag: string;
  title: string;
  desc: string;
  items: string[];
  onClick?: () => void;
}) {
  return (
    <div className="card pillar interactive" onClick={onClick}>
      <div className="pillar-head">
        <span className="tag">{tag}</span>
        <span className="pillar-arrow">
          <IconArrow size={16} />
        </span>
      </div>
      <h3>{title}</h3>
      <p>{desc}</p>
      <ul className="pillar-list">
        {items.map((it, i) => (
          <li key={i}>
            <span className="check mono">→</span>
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PillarCard;
