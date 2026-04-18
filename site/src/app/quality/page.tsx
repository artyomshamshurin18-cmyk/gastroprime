import type { Metadata } from "next";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "Качество и контроль",
  description:
    "Черновик страницы качества для нового сайта GastroPrime: санитарные стандарты, производственный контроль, логистика и прозрачность для корпоративного клиента.",
};

const pillars = [
  {
    title: "Санитарные стандарты",
    text: "Отдельный блок под HACCP, Меркурий, внутренние процессы контроля и понятное описание того, как GastroPrime управляет качеством на практике.",
  },
  {
    title: "Логистика и температура",
    text: "Клиенту важно видеть не только красивую еду, но и то, как она приедет вовремя, в нужное окно и в нужном состоянии.",
  },
  {
    title: "Стабильность поставки",
    text: "Для B2B это одна из главных причин купить. На новом сайте это должно быть вынесено в отдельный сильный аргумент, а не растворяться в общих обещаниях.",
  },
  {
    title: "Прозрачность для клиента",
    text: "Фотографии производства, описание процесса, документы, FAQ и в перспективе цифровая связка с кабинетом помогают продавать доверие, а не только вкус.",
  },
];

export default function QualityPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <SectionHeading
        eyebrow="Качество"
        title="Одна из самых важных страниц нового сайта"
        description="Для корпоративного клиента аргументы про контроль, безопасность и стабильность поставки часто важнее, чем просто красивые фото блюд. Поэтому эта страница нужна уже на MVP-этапе."
      />
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {pillars.map((item) => (
          <div key={item.title} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{item.title}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">{item.text}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
