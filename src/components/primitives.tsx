import type {
  ButtonHTMLAttributes,
  ChangeEvent,
  HTMLAttributes,
  InputHTMLAttributes,
  LabelHTMLAttributes,
  PropsWithChildren,
  SelectHTMLAttributes,
} from 'react'

function joinClassNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ')
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={joinClassNames(
        'rounded-3xl border border-white/10 bg-slate-950/75 shadow-[0_24px_60px_rgba(2,6,23,0.45)] backdrop-blur-xl',
        className,
      )}
      {...props}
    />
  )
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
}

export function Button({ className, variant = 'primary', type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={joinClassNames(
        'inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' &&
          'bg-cyan-400 text-slate-950 hover:bg-cyan-300 shadow-[0_16px_40px_rgba(34,211,238,0.18)]',
        variant === 'secondary' &&
          'border border-white/12 bg-white/5 text-slate-100 hover:bg-white/10',
        variant === 'ghost' && 'text-slate-300 hover:bg-white/5 hover:text-white',
        className,
      )}
      {...props}
    />
  )
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={joinClassNames(
        'w-full rounded-2xl border border-white/12 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400/60',
        className,
      )}
      {...props}
    />
  )
}

type SelectProps = PropsWithChildren<
  SelectHTMLAttributes<HTMLSelectElement> & {
    value: string | number
    onChange: (event: ChangeEvent<HTMLSelectElement>) => void
  }
>

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={joinClassNames(
        'w-full appearance-none rounded-2xl border border-white/12 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none focus:border-cyan-400/60',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={joinClassNames('mb-2 block text-sm font-medium text-slate-300', className)} {...props} />
}

export function KeyValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-white/6 py-3 last:border-b-0 last:pb-0 first:pt-0">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="max-w-[60%] text-right text-sm text-slate-100 break-all">{value}</span>
    </div>
  )
}
