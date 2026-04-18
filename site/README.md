# GastroPrime marketing site draft

Это черновик нового сайта `gastroprime.ru`, который должен заменить Tilda.

## Зачем он нужен
- чистый SEO-контроль
- редактирование через код и помощника
- сегментные страницы без конструкторного мусора
- чистые юридические URL
- форма заявок через ваш backend, а не через Tilda

## Что уже заложено
- Next.js App Router
- каркас главной
- сегментные страницы (`/office`, `/construction`, `/warehouses`, `/production`, `/government`, `/healthy-meals`)
- `robots.ts` и `sitemap.ts`
- заготовка редиректов со старых Tilda URL в `next.config.ts`

## Как запустить
```bash
npm install --cache ../.npm-cache
npm run dev
```

## Что дальше
1. подключить реальные фотографии и меню
2. перенести и вычитать тексты
3. сделать страницу качества / HACCP / Меркурий
4. подключить форму к backend
5. добавить кейсы и FAQ-хаб
6. подготовить staging и deploy script
