import type { Metadata } from "next";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "О компании",
  description: "Черновик страницы о компании GastroPrime: производственный подход, контроль качества, логистика и управляемый сервис вместо конструкторного лендинга.",
};

const pillars = [
  "Контроль качества и санитарные процессы как часть бренда, а не мелкий текст внизу страницы.",
  "Логистика, окна доставки и управление сменами как реальная ценность для B2B-клиента.",
  "Персональный менеджер и цифровой сценарий взаимодействия через ваш продукт.",
  "Контент, который можно быстро обновлять кодом: кейсы, меню, FAQ, офферы и юридические страницы.",
];

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <SectionHeading
        eyebrow="О компании"
        title="Новый сайт должен показывать GastroPrime как сервисную систему, а не просто красивую витрину с едой"
        description="Эта страница в драфте — заготовка под полноценный рассказ о производстве, подходе к качеству, команде и операционной надёжности."
      />
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {pillars.map((item) => (
          <div key={item} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-base leading-8 text-slate-700">{item}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
