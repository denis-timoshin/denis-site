// Чек-лист «Фавикон и иконки сайта»: иконка вкладки, иконки для телефонов, manifest, отображение в поиске.
//
// type: pos — позитивная, neg — негативная, req — требование к поведению.
// ex — пример данных или действия; field — подзаголовок внутри раздела.

export default {
  slug: 'favicon',
  name: 'Фавикон и иконки сайта',
  title: 'Чек-лист тестирования фавикона и иконок сайта',
  h1: 'Чек-лист тестирования фавикона и иконок сайта',
  description: 'Чек-лист тестирования фавикона: форматы и размеры, иконки для iPhone и Android, manifest, тёмная тема, иконка в выдаче Яндекса и Google, кеш.',
  lead: 'Фавикон замечают, только когда его нет: пустой листок во вкладке, серый квадрат в выдаче или размытая иконка на экране телефона. Проверяем, что иконка есть везде, где её ищут браузеры, поисковики и телефоны.',
  updated: '2026-11-21',
  related: ['404', 'header', 'adaptivnost', 'krossbrauzernost', 'splash'],

  sections: [
    {
      id: 'podklyuchenie', icon: '🔗', title: 'Подключение',
      items: [
        { type: 'req', t: 'Иконка подключена в <head> каждой страницы, а не только главной', ex: '<link rel="icon" href="/favicon.png">' },
        { type: 'req', t: 'Путь к иконке абсолютный — работает на вложенных страницах', ex: '/favicon.svg, а не favicon.svg' },
        { type: 'pos', t: 'Файл иконки открывается по прямой ссылке и отдаёт 200', ex: 'curl -I https://site.ru/favicon.png' },
        { type: 'req', t: 'Правильный content-type у каждого формата', ex: 'image/png, image/svg+xml, image/x-icon' },
        { type: 'neg', t: '/favicon.ico в корне не отдаёт 404 — его запрашивают браузеры и сервисы без учёта <link>', ex: 'curl -I https://site.ru/favicon.ico' },
        { type: 'neg', t: 'Иконка есть на странице 404, на страницах ошибок и техработ' },
        { type: 'neg', t: 'Нет дублирующих и конфликтующих <link rel="icon"> с разными картинками' },
      ]
    },
    {
      id: 'formaty', icon: '🖼️', title: 'Форматы и размеры',
      items: [
        { type: 'req', t: 'Есть favicon.ico (16×16 и 32×32 внутри) для старых браузеров и сервисов' },
        { type: 'req', t: 'Есть PNG 32×32 или SVG для современных браузеров', ex: '<link rel="icon" type="image/svg+xml" href="/favicon.svg">' },
        { type: 'req', t: 'Иконка для iPhone и iPad — 180×180, без прозрачности', ex: '<link rel="apple-touch-icon" href="/apple-touch-icon.png">' },
        { type: 'req', t: 'Иконки 192×192 и 512×512 для Android указаны в manifest' },
        { type: 'pos', t: 'Иконка чёткая на ретина-экранах, не размыта на 16×16' },
        { type: 'pos', t: 'Иконка узнаваема в маленьком размере: без мелкого текста и тонких линий' },
        { type: 'neg', t: 'Вес файлов разумный — иконка не весит сотни килобайт', ex: '< 10 КБ для 32×32' },
      ]
    },
    {
      id: 'otobrazhenie', icon: '👀', title: 'Отображение',
      items: [
        { field: 'Браузер', type: 'pos', t: 'Иконка видна во вкладке в Chrome, Safari, Firefox, Edge, Яндекс Браузере' },
        { field: 'Браузер', type: 'pos', t: 'Иконка видна в закладках и истории браузера' },
        { field: 'Браузер', type: 'pos', t: 'Иконка различима на светлой и тёмной теме вкладок', ex: 'macOS: Системные настройки → Оформление → Тёмное' },
        { field: 'Браузер', type: 'pos', t: 'SVG-иконка меняет цвет под тему, если так задумано', ex: '@media (prefers-color-scheme: dark) внутри SVG' },
        { field: 'Браузер', type: 'neg', t: 'Прозрачный фон не делает иконку невидимой на тёмной вкладке' },
        { field: 'Телефон', type: 'pos', t: '«На экран Домой» на iPhone — своя иконка, а не скриншот страницы' },
        { field: 'Телефон', type: 'pos', t: 'Ярлык на Android — иконка из manifest, не обрезана маской', ex: 'maskable-иконка с отступами' },
        { field: 'Телефон', type: 'pos', t: 'Название ярлыка короткое и понятное', ex: 'short_name в manifest' },
        { field: 'Телефон', type: 'pos', t: 'Цвет панели браузера на телефоне задан', ex: '<meta name="theme-color" content="#0a0a0a">' },
      ]
    },
    {
      id: 'manifest', icon: '📄', title: 'Manifest',
      items: [
        { type: 'req', t: 'Файл manifest подключён и открывается', ex: '<link rel="manifest" href="/site.webmanifest">' },
        { type: 'req', t: 'manifest — валидный JSON с name, short_name, icons, theme_color, background_color' },
        { type: 'neg', t: 'Все пути к иконкам в manifest рабочие, размеры в sizes совпадают с реальными' },
        { type: 'pos', t: 'DevTools → Application → Manifest не показывает ошибок' },
      ]
    },
    {
      id: 'poisk', icon: '🔎', title: 'Поисковики и соцсети',
      items: [
        { type: 'req', t: 'Иконка для выдачи: квадрат, не меньше 48×48 (Google) и 120×120 (Яндекс рекомендует)' },
        { type: 'req', t: 'Иконка не закрыта от роботов в robots.txt', ex: 'Disallow: /favicon.ico — ошибка' },
        { type: 'pos', t: 'Иконка появилась в выдаче Яндекса и Google после переобхода', ex: 'обычно от нескольких дней до пары недель' },
        { type: 'neg', t: 'В выдаче нет чужой или старой иконки' },
        { type: 'pos', t: 'Превью ссылки в мессенджерах показывает иконку сайта, если OG-картинки нет', ex: 'Telegram, VK' },
      ]
    },
    {
      id: 'obnovlenie', icon: '🔄', title: 'Обновление и кеш',
      items: [
        { type: 'neg', t: 'После замены иконки пользователи видят новую, а не старую из кеша', ex: '/favicon.png?v=2' },
        { type: 'neg', t: 'Новая иконка обновилась в закладках и на экране «Домой» — или известно, что для этого нужно переустановить ярлык' },
        { type: 'req', t: 'Для файлов иконок задано разумное кеширование', ex: 'Cache-Control: max-age=604800' },
      ]
    },
  ]
};
