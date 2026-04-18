import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { cases } from "@/content/cases";

export const metadata: Metadata = {
  title: "Кейсы",
  description:
    "Черновик раздела кейсов для нового сайта GastroPrime. Здесь должны жить реальные истории внедрения, цифры и доверие, а не общие обещания.",
};

export default function CasesPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <SectionHeading
        eyebrow="Кейсы"
        title="Раздел, который должен превращать интерес в доверие"
        description="Кейсы нужны не ради красоты. Для корпоративного клиента это главный способ увидеть, что GastroPrime умеет работать с реальными объектами, сменами и ограничениями."
      />
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {cases.map((item) => (
          <Link
            key={item.slug}
            href={`/cases/${item.slug}`}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">{item.segment}</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{item.title}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">{item.challenge}</p>
            <div className="mt-6 text-sm font-medium text-slate-950">Открыть кейс →</div>
          </Link>
        ))}
      </div>
    </main>
  );
}
