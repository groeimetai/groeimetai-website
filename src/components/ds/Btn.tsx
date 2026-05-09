import type { ReactNode, ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react';

type Variant = 'primary' | 'ghost';

type BtnAsButton = {
  href?: undefined;
  variant?: Variant;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

type BtnAsLink = {
  href: string;
  variant?: Variant;
  children: ReactNode;
} & AnchorHTMLAttributes<HTMLAnchorElement>;

type BtnProps = BtnAsButton | BtnAsLink;

export function Btn(props: BtnProps) {
  const { variant = 'primary', children, className = '', ...rest } = props as BtnProps & { className?: string };
  const cls = `btn btn-${variant}${className ? ' ' + className : ''}`;
  if ('href' in rest && rest.href) {
    return (
      <a className={cls} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </a>
    );
  }
  return (
    <button className={cls} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}

export default Btn;
