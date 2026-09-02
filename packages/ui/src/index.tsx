import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

export function Button({ children, className = '', ...props }: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  return <button className={`rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-700 disabled:opacity-50 ${className}`} {...props}>{children}</button>;
}
