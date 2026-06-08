import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type Accent = 'blue' | 'emerald' | 'indigo' | 'amber' | 'slate';

const accentMap: Record<
  Accent,
  {
    band: string;
    icon: string;
    line: string;
    button: string;
    soft: string;
  }
> = {
  blue: {
    band: 'from-slate-950 via-blue-950 to-slate-900',
    icon: 'bg-blue-500/15 text-blue-100 ring-blue-300/20',
    line: 'bg-blue-400',
    button: 'bg-blue-600 hover:bg-blue-700 text-white',
    soft: 'bg-blue-50 text-blue-700 ring-blue-100',
  },
  emerald: {
    band: 'from-slate-950 via-emerald-950 to-slate-900',
    icon: 'bg-emerald-500/15 text-emerald-100 ring-emerald-300/20',
    line: 'bg-emerald-400',
    button: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    soft: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  },
  indigo: {
    band: 'from-slate-950 via-indigo-950 to-slate-900',
    icon: 'bg-indigo-500/15 text-indigo-100 ring-indigo-300/20',
    line: 'bg-indigo-400',
    button: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    soft: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
  },
  amber: {
    band: 'from-slate-950 via-amber-950 to-slate-900',
    icon: 'bg-amber-500/15 text-amber-100 ring-amber-300/20',
    line: 'bg-amber-400',
    button: 'bg-amber-500 hover:bg-amber-600 text-slate-950',
    soft: 'bg-amber-50 text-amber-800 ring-amber-100',
  },
  slate: {
    band: 'from-slate-950 via-slate-900 to-slate-800',
    icon: 'bg-slate-500/15 text-slate-100 ring-slate-300/20',
    line: 'bg-slate-300',
    button: 'bg-slate-950 hover:bg-slate-800 text-white',
    soft: 'bg-slate-50 text-slate-700 ring-slate-200',
  },
};

export type FunctionalMetric = {
  label: string;
  value: string | number;
  detail?: string;
  icon: LucideIcon;
  tone?: Accent;
};

export type FunctionalAction = {
  label: string;
  description?: string;
  icon: LucideIcon;
  onClick?: () => void;
  href?: string;
};

type PremiumFunctionalShellProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  accent?: Accent;
  metrics?: FunctionalMetric[];
  actions?: FunctionalAction[];
  children: ReactNode;
  rightRail?: ReactNode;
  className?: string;
};

export function PremiumFunctionalShell({
  eyebrow,
  title,
  subtitle,
  icon: Icon,
  accent = 'blue',
  metrics = [],
  actions = [],
  children,
  rightRail,
  className,
}: PremiumFunctionalShellProps) {
  const accentClasses = accentMap[accent];

  return (
    <div className={cn('min-h-screen bg-slate-50 text-slate-950', className)}>
      <section className={cn('relative overflow-hidden bg-gradient-to-br text-white', accentClasses.band)}>
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.9)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.9)_1px,transparent_1px)] [background-size:44px_44px]" />
        <div
          className={cn(
            'relative mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8',
            metrics.length > 0 ? 'pb-20' : 'pb-8'
          )}
        >
          <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
            <div className="max-w-3xl">
              <div className="mb-5 flex items-center gap-3">
                <span className={cn('grid h-12 w-12 place-items-center rounded-lg ring-1', accentClasses.icon)}>
                  <Icon className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-white/60">
                    {eyebrow}
                  </p>
                  <div className={cn('mt-2 h-1 w-16 rounded-full', accentClasses.line)} />
                </div>
              </div>
              <h1 className="max-w-3xl text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                {title}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
                {subtitle}
              </p>
            </div>

            {actions.length > 0 && (
              <div className="grid gap-3 rounded-lg border border-white/10 bg-white/8 p-3 backdrop-blur">
                {actions.map((action) => {
                  const ActionIcon = action.icon;
                  const content = (
                    <>
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-white/10">
                        <ActionIcon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1 text-left">
                        <span className="block truncate text-sm font-black">{action.label}</span>
                        {action.description && (
                          <span className="mt-0.5 block truncate text-xs text-slate-300">
                            {action.description}
                          </span>
                        )}
                      </span>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-white/55" />
                    </>
                  );

                  if (action.href) {
                    return (
                      <a
                        key={action.label}
                        href={action.href}
                        className="flex min-h-14 items-center gap-3 rounded-md px-3 py-2 transition hover:bg-white/10"
                      >
                        {content}
                      </a>
                    );
                  }

                  return (
                    <button
                      key={action.label}
                      type="button"
                      onClick={action.onClick}
                      className="flex min-h-14 items-center gap-3 rounded-md px-3 py-2 transition hover:bg-white/10"
                    >
                      {content}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      <main
        className={cn(
          'relative z-10 mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8',
          metrics.length > 0 ? '-mt-14' : 'py-8'
        )}
      >
        {metrics.length > 0 && (
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => (
              <FunctionalMetricCard key={metric.label} metric={metric} />
            ))}
          </div>
        )}

        <div className={cn('grid gap-6', rightRail && 'lg:grid-cols-[1fr_340px]')}>
          <div className="min-w-0">{children}</div>
          {rightRail && <aside className="min-w-0 space-y-6">{rightRail}</aside>}
        </div>
      </main>
    </div>
  );
}

function FunctionalMetricCard({ metric }: { metric: FunctionalMetric }) {
  const Icon = metric.icon;
  const tone = accentMap[metric.tone || 'slate'];

  return (
    <div className="min-h-36 rounded-lg border border-slate-200 bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <span className={cn('grid h-10 w-10 place-items-center rounded-md ring-1', tone.soft)}>
          <Icon className="h-5 w-5" />
        </span>
        <CheckCircle2 className="h-4 w-4 text-slate-300" />
      </div>
      <div className="mt-5">
        <p className="text-3xl font-black tracking-tight text-slate-950">{metric.value}</p>
        <p className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-slate-500">
          {metric.label}
        </p>
        {metric.detail && <p className="mt-2 text-xs leading-5 text-slate-500">{metric.detail}</p>}
      </div>
    </div>
  );
}

export function FunctionalPanel({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-black uppercase tracking-[0.16em] text-slate-800">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function FunctionalEmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-white text-slate-500 ring-1 ring-slate-200">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="mt-4 text-lg font-black text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

type FunctionalPrimaryButtonProps = ComponentPropsWithoutRef<typeof Button> & {
  accent?: Accent;
};

export const FunctionalPrimaryButton = forwardRef<HTMLButtonElement, FunctionalPrimaryButtonProps>(
  ({ children, accent = 'blue', className, type = 'button', ...props }, ref) => (
    <Button
      ref={ref}
      type={type}
      className={cn(
        'h-11 rounded-md px-5 text-sm font-black shadow-lg shadow-slate-950/10',
        accentMap[accent].button,
        className
      )}
      {...props}
    >
      {children}
    </Button>
  )
);

FunctionalPrimaryButton.displayName = 'FunctionalPrimaryButton';
