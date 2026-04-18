import Link from "next/link";
import { company, navigation } from "@/content/site";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.3fr,1fr,1fr] lg:px-8">
        <div className="space-y-3">
          <div className="text-lg font-semibold text-slate-950">{company.name}</div>
          <p className="max-w-md text-sm text-slate-600">
            Новый маркетинговый сайт проектируется как управляемая кодовая база: без Tilda, с чистыми URL, SEO-контролем и контентом, который можно править через помощника.
          </p>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Разделы</h3>
          <div className="grid gap-2 text-sm text-slate-600">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-slate-950">
                {item.label}
              </Link>
            ))}
            <Link href="/offer" className="transition hover:text-slate-950">Оферта</Link>
            <Link href="/refund" className="transition hover:text-slate-950">Возврат</Link>
          </div>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Контакты</h3>
          <div className="grid gap-2 text-sm text-slate-600">
            <a href={`tel:${company.phone.replace(/[^+\d]/g, "")}`} className="transition hover:text-slate-950">{company.phone}</a>
            <a href={`mailto:${company.email}`} className="transition hover:text-slate-950">{company.email}</a>
            <p>{company.city}</p>
            <p>{company.address}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
