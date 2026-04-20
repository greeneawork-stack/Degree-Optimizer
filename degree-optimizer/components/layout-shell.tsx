"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import type { PropsWithChildren } from "react";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/onboarding", label: "Onboarding" },
  { href: "/progress", label: "Progress" },
  { href: "/dashboard", label: "Dashboard" },
] as const satisfies ReadonlyArray<{ href: Route; label: string }>;

type LayoutShellProps = PropsWithChildren<{
  title?: string;
  description?: string;
}>;

export function LayoutShell({ children, title, description }: LayoutShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-transparent text-black">
      <header className="border-b border-black/15 bg-[var(--brand-surface)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Degree Optimizer
          </Link>
          <nav className="flex flex-wrap items-center gap-2 rounded-full border border-black/15 bg-[var(--brand-surface)] p-1 text-sm shadow-sm">
            {navigation.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-3 py-1.5 transition ${
                    active
                      ? "bg-[color:var(--brand-gold)] text-black shadow-sm"
                      : "text-black hover:bg-[color:var(--brand-gold-soft)] hover:text-black"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">
        {(title || description) && (
          <section className="mb-10 rounded-[2rem] border border-black/15 bg-[var(--brand-surface)] px-8 py-8 shadow-sm">
            {title ? <h1 className="text-3xl font-semibold text-black sm:text-4xl">{title}</h1> : null}
            {description ? (
              <p className="mt-3 max-w-3xl text-sm leading-6 text-black sm:text-base">{description}</p>
            ) : null}
          </section>
        )}
        {children}
      </main>
    </div>
  );
}
