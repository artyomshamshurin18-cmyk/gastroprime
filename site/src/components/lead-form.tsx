type LeadFormProps = {
  title?: string;
  description?: string;
};

export function LeadForm({
  title = "Оставить заявку на дегустацию или расчёт",
  description = "Это драфт формы. На следующем этапе подключим её к вашему backend или воронке уведомлений, чтобы лиды не зависели от Tilda.",
}: LeadFormProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="space-y-3">
        <h3 className="text-2xl font-semibold tracking-tight text-slate-950">{title}</h3>
        <p className="text-sm leading-7 text-slate-600">{description}</p>
      </div>
      <form className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm text-slate-600">
          <span>Имя</span>
          <input className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500" placeholder="Как к вам обращаться" />
        </label>
        <label className="grid gap-2 text-sm text-slate-600">
          <span>Телефон</span>
          <input className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500" placeholder="+7 ..." />
        </label>
        <label className="grid gap-2 text-sm text-slate-600 sm:col-span-2">
          <span>Компания / объект</span>
          <input className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500" placeholder="Офис, склад, стройка, производство..." />
        </label>
        <label className="grid gap-2 text-sm text-slate-600 sm:col-span-2">
          <span>Задача</span>
          <textarea className="min-h-28 rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-500" placeholder="Сколько человек, график, бюджет, пожелания к меню" />
        </label>
        <button type="button" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 sm:col-span-2 sm:w-fit">
          Отправка подключится на следующем этапе
        </button>
      </form>
    </div>
  );
}
