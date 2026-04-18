import type { Metadata } from "next";
import { LeadForm } from "@/components/lead-form";
import { SectionHeading } from "@/components/section-heading";

export const metadata: Metadata = {
  title: "Оставить заявку",
  description: "Страница заявки в новой версии сайта GastroPrime. Здесь можно будет подключить backend и отказаться от Tilda-форм.",
};

export default function RequestPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <SectionHeading
        eyebrow="Заявка"
        title="Здесь будет единая точка захвата лидов вместо Tilda-форм и технических thank-you страниц"
        description="На следующем этапе подключим форму к вашему backend, сохраним лид в базе, отправим уведомление и сможем вести аналитику без посредников."
      />
      <div className="mt-10">
        <LeadForm title="Запросить дегустацию, меню или расчёт" />
      </div>
    </main>
  );
}
