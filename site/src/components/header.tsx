import Link from "next/link";
import { company, navigation } from "@/content/site";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <Link href="/" className="text-lg font-semibold tracking-tight text-slate-950">
            {company.name}
          </Link>
          <p className="text-xs text-slate-500">Корпоративное питание для компаний и объектов</p>
        </div>
        <nav className="hidden items-center gap-5 text-sm text-slate-600 lg:flex">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-slate-950">
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/request"
          className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Оставить заявку
        </Link>
      </div>
    </header>
  );
}
