import Link from "next/link";
import { LeadForm } from "@/components/lead-form";
import { SectionHeading } from "@/components/section-heading";
import {
  featuredCases,
  heroBullets,
  homeFaq,
  primaryStats,
  processSteps,
  solutions,
} from "@/content/site";

export default function Home() {
  return (
    <main>
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-6 lg:px-8 lg:pb-24 lg:pt-24">
        <div className="grid gap-12 lg:grid-cols-[1.15fr,0.85fr] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
              Драфт нового сайта вместо Tilda
            </div>
            <div className="space-y-5">
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Корпоративное питание, которое продаёт не еду, а управляемый сервис для компаний и объектов.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                Это первый рабочий каркас новой версии {"GastroPrime"}. Здесь уже закладывается то, чего не хватает Tilda: чистая SEO-структура, сегментные страницы, управляемый контент и база под будущий деплой на ваш сервер.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {heroBullets.map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-700 shadow-sm">
                  {item}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-4">
              <Link href="/request" className="rounded-full bg-slate-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-800">
                Запросить дегустацию
              </Link>
              <Link href="#solutions" className="rounded-full border border-slate-300 px-6 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-950 hover:text-slate-950">
                Посмотреть решения
              </Link>
            </div>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              {primaryStats.map((item) => (
                <div key={item.label} className="rounded-2xl bg-slate-50 p-5">
                  <div className="text-3xl font-semibold tracking-tight text-slate-950">{item.value}</div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl bg-slate-950 p-6 text-white">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">Почему это сильнее текущего сайта</p>
              <p className="mt-3 text-base leading-7 text-slate-200">
                Новый сайт строится как часть вашей реальной системы: маркетинг, SEO, формы и связка с личным кабинетом, а не просто как набор Tilda-блоков.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="solutions" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <SectionHeading
          eyebrow="Решения"
          title="Сегментные страницы под реальные сценарии, а не копии одной и той же посадки"
          description="Это ключевой принцип новой версии. Каждая страница должна бить в конкретную боль сегмента и вести к своей понятной заявке."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {solutions.map((solution) => (
            <Link
              key={solution.slug}
              href={`/${solution.slug}`}
              className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">{solution.shortLabel}</p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{solution.heroTitle}</h3>
              <p className="mt-4 text-sm leading-7 text-slate-600">{solution.heroSubtitle}</p>
              <div className="mt-6 text-sm font-medium text-slate-950">Открыть страницу →</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <SectionHeading
            eyebrow="Процесс"
            title="Как должен выглядеть путь клиента на сильном сайте"
            description="Не просто оставить заявку, а понять, что GastroPrime умеет запускать питание как сервис: от диагностики до стабильной работы."
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-4">
            {processSteps.map((step, index) => (
              <div key={step.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">Шаг {index + 1}</div>
                <h3 className="mt-3 text-xl font-semibold text-slate-950">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <SectionHeading
          eyebrow="Доверие"
          title="Сайт должен продавать не только вкус, но и управляемость"
          description="Вот почему в новой версии мы закладываем отдельные блоки под качество, логистику, кейсы, цифры и будущую цифровую связку с вашим кабинетом."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h3 className="text-2xl font-semibold tracking-tight text-slate-950">Что обязательно усилить по сравнению с Tilda</h3>
            <ul className="mt-6 grid gap-4 text-sm leading-7 text-slate-600">
              <li>• кейсы с конкретными цифрами и типами объектов;</li>
              <li>• отдельную страницу про качество, HACCP, Меркурий и процессы;</li>
              <li>• FAQ под офисы, склады, стройки и производства;</li>
              <li>• чистые юридические страницы без технических Tilda URL;</li>
              <li>• нормальную SEO-архитектуру и редиректы со старых адресов.</li>
            </ul>
          </div>
          <div className="grid gap-4">
            {featuredCases.map((item) => (
              <div key={item.title} className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
                <h3 className="text-xl font-semibold tracking-tight text-slate-950">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-700">{item.outcome}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <SectionHeading
            eyebrow="FAQ"
            title="Важные вопросы, которые новый сайт должен закрывать без переписки в чатах"
            description="Это не финальный FAQ, а стартовая структура, которую можно расширять по мере развития сайта и продаж."
          />
          <div className="mt-10 grid gap-4">
            {homeFaq.map((item) => (
              <div key={item.question} className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <h3 className="text-lg font-semibold text-slate-950">{item.question}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <LeadForm />
      </section>
    </main>
  );
}
