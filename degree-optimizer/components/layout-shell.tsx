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
    <div className="min-h-screen bg-transparent text-slate-950">
      <header className="border-b border-white/60 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Degree Optimizer
          </Link>
          <nav className="flex flex-wrap items-center gap-2 rounded-full border border-slate-200 bg-white p-1 text-sm shadow-sm">
            {navigation.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-3 py-1.5 transition ${
                    active
                      ? "bg-sky-500 text-white shadow-sm"
                      : "text-slate-600 hover:bg-sky-50 hover:text-sky-700"
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
          <section className="mb-10 rounded-[2rem] border border-slate-200 bg-white/90 px-8 py-8 shadow-sm">
            {title ? <h1 className="text-3xl font-semibold text-slate-950 sm:text-4xl">{title}</h1> : null}
            {description ? (
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">{description}</p>
            ) : null}
          </section>
        )}
        {children}
      </main>
    </div>
  );
}
