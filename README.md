# denis-timoshin.ru

Одностраничный сайт курсов Дениса Тимошина: QA, управление командой и работа с нейросетями.

Живой сайт: https://denis-timoshin.ru

## Стек

React 19 + Vite 8, Tailwind CSS 3, framer-motion. Хостинг — GitHub Pages.

## Разработка

```bash
npm install
npm run dev      # локальный сервер с горячей перезагрузкой
npm run build    # production-сборка в dist/
npm run preview  # посмотреть собранную версию
npm run lint     # oxlint
```

Нужен Node 20.19+ или 22+ (требование Vite 8).

## Структура

```
index.html                 разметка-обёртка, мета-теги и SEO
src/App.jsx                все секции страницы
src/data.js                контент: курсы, отзывы, FAQ, преимущества
public/                    изображения, robots.txt, sitemap.xml, CNAME
public/404.html            страница 404 (GitHub Pages отдаёт её сам)
.github/workflows/deploy.yml  сборка и публикация
```

Тексты курсов и отзывов правятся в `src/data.js` — трогать разметку для этого не нужно.

## Деплой

Любой push в `main` автоматически собирает проект и публикует его на GitHub Pages.
Запустить деплой вручную можно во вкладке Actions (workflow_dispatch).

Домен задан в `CNAME`; файл лежит и в корне, и в `public/`, чтобы попадать в сборку.

## Изображения

Аватарки отзывов показываются кружками ~56px — держите их в пределах 300px по большей
стороне в JPEG. Фото в hero и в блоке «Обо мне» с прозрачным фоном, поэтому остаются PNG.
`timoshin_it_key.jpg` используется как превью для соцсетей (og:image).
