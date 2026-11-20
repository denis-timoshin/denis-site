import { useEffect, useState } from 'react';
import { Navbar, Footer } from '../components/SiteChrome';
import { getConsent, resetConsent, onConsentChange } from '../consent';

// Шаблон политики для сайта, который собирает данные только через Яндекс Метрику.
// Перед публикацией сверьте с юристом; при появлении форм на сайте политику нужно расширить.
export const PRIVACY = {
  updated: '2026-11-21',
  operator: 'Тимошин Денис',
  site: 'denis-timoshin.ru',
  phone: '+7 987 570-66-60',
  phoneHref: 'tel:+79875706600',
  telegram: '@timoshin_denis',
  telegramHref: 'https://t.me/timoshin_denis',
};

const formatDate = iso => new Date(iso + 'T00:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

const CONSENT_LABEL = { accepted: 'вы разрешили cookie и аналитику', declined: 'вы отказались от cookie и аналитики' };

function ConsentStatus() {
  // Статус берётся из браузера — до гидратации его нет, чтобы разметка совпала с пре-рендером
  const [consent, setConsentState] = useState(undefined);
  useEffect(() => {
    setConsentState(getConsent());
    return onConsentChange(setConsentState);
  }, []);
  if (consent === undefined) return null;
  return (
    <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm">
      <span className="text-gray-300">
        Сейчас {consent ? CONSENT_LABEL[consent] : 'вы ещё не выбрали, разрешить ли cookie'}.
      </span>
      {consent && (
        <button type="button" onClick={resetConsent} className="font-semibold text-[#ef5d2b] hover:text-[#ff7a4a]">
          Изменить решение
        </button>
      )}
    </div>
  );
}

const Section = ({ n, title, children }) => (
  <section className="mt-10">
    <h2 className="text-xl sm:text-2xl font-bold tracking-tight"><span className="text-[#ef5d2b] mr-2">{n}.</span>{title}</h2>
    <div className="mt-3 space-y-3 text-gray-300 leading-relaxed">{children}</div>
  </section>
);

const List = ({ items }) => (
  <ul className="space-y-2">
    {items.map(t => (
      <li key={t} className="flex gap-2.5"><span className="w-1.5 h-1.5 rounded-full bg-[#ef5d2b] shrink-0 mt-2.5" />{t}</li>
    ))}
  </ul>
);

export default function PrivacyPage() {
  const p = PRIVACY;
  return (
    <div className="font-sans antialiased text-white bg-[#0a0a0a] overflow-x-clip selection:bg-[#ef5d2b] selection:text-white min-h-screen">
      <Navbar />
      <main className="relative max-w-3xl mx-auto px-4 sm:px-6 pb-20">
        <nav aria-label="Хлебные крошки" className="flex gap-2 text-[13px] text-gray-500 pt-24 sm:pt-28">
          <a href="/" className="hover:text-white transition-colors">Главная</a><span>/</span><span>Политика конфиденциальности</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-[1.15] mt-8">Политика обработки персональных данных</h1>
        <p className="text-gray-400 mt-4">Редакция от <time dateTime={p.updated}>{formatDate(p.updated)}</time></p>

        <Section n="1" title="Общие положения">
          <p>
            Политика описывает, какие данные собираются при посещении сайта {p.site} (далее — сайт), зачем и как
            они обрабатываются. Она составлена в соответствии с Федеральным законом № 152-ФЗ «О персональных данных».
          </p>
          <p>Оператор персональных данных — {p.operator} (далее — оператор).</p>
          <p>Пользуясь сайтом и нажимая «Принять» в уведомлении о cookie, вы соглашаетесь с этой политикой.</p>
        </Section>

        <Section n="2" title="Какие данные собираются">
          <p>На сайте нет форм: имя, телефон, e-mail и другие сведения о себе вы не вводите. Автоматически, с вашего согласия, собираются:</p>
          <List items={[
            'файлы cookie и идентификатор браузера;',
            'IP-адрес и примерное местоположение (город);',
            'тип устройства, операционная система, браузер, разрешение экрана;',
            'адреса просмотренных страниц, источник перехода, время на сайте;',
            'действия на страницах: клики, прокрутка, переходы по ссылкам.',
          ]} />
          <p>
            Отметки в чек-листах хранятся только в вашем браузере (localStorage) и никуда не передаются.
            Их можно удалить кнопкой «Сбросить» на странице чек-листа или очисткой данных сайта в браузере.
          </p>
        </Section>

        <Section n="3" title="Зачем это нужно">
          <List items={[
            'считать посещаемость и понимать, какие материалы полезны;',
            'находить и исправлять ошибки и неудобства на сайте;',
            'оценивать, откуда приходят посетители.',
          ]} />
          <p>Данные не используются для показа рекламы и не продаются.</p>
        </Section>

        <Section n="4" title="Правовое основание">
          <p>Данные обрабатываются на основании вашего согласия. Пока вы его не дали, сервис аналитики на сайте не загружается.</p>
        </Section>

        <Section n="5" title="Кому передаются данные">
          <p>
            Для сбора статистики используется сервис Яндекс Метрика (ООО «Яндекс», Россия). Данные хранятся на серверах
            в России и обрабатываются по{' '}
            <a href="https://yandex.ru/legal/metrica_termsofuse/" target="_blank" rel="noopener noreferrer" className="text-white underline underline-offset-2 decoration-white/30 hover:text-[#ef5d2b]">условиям использования Яндекс Метрики</a>.
            Оператор видит только обезличенную статистику.
          </p>
          <p>
            Ссылки на курсы ведут на сторонние сайты (например, Stepik). Данные, которые вы оставляете там,
            обрабатываются по правилам этих сайтов.
          </p>
        </Section>

        <Section n="6" title="Сроки хранения">
          <p>
            Cookie Яндекс Метрики хранятся в браузере до одного года, если вы не удалите их раньше. Статистика хранится
            в Яндекс Метрике по правилам сервиса. После отзыва согласия новые данные не собираются.
          </p>
        </Section>

        <Section n="7" title="Как отказаться">
          <List items={[
            'нажать «Отказаться» в уведомлении о cookie — Яндекс Метрика не загрузится;',
            'изменить решение в любой момент на этой странице;',
            'запретить или удалить cookie в настройках браузера.',
          ]} />
          <ConsentStatus />
        </Section>

        <Section n="8" title="Ваши права">
          <p>
            Вы вправе узнать, какие данные о вас обрабатываются, потребовать их уточнения или удаления и отозвать согласие.
            Оператор отвечает на обращения в течение 10 рабочих дней.
          </p>
          <p>
            Связаться с оператором:{' '}
            <a href={p.telegramHref} target="_blank" rel="noopener noreferrer" className="text-white underline underline-offset-2 decoration-white/30 hover:text-[#ef5d2b]">Telegram {p.telegram}</a>
            {' '}или по телефону{' '}
            <a href={p.phoneHref} className="text-white underline underline-offset-2 decoration-white/30 hover:text-[#ef5d2b] whitespace-nowrap">{p.phone}</a>.
          </p>
        </Section>

        <Section n="9" title="Изменения политики">
          <p>Оператор может обновлять политику. Актуальная редакция всегда доступна на этой странице, дата редакции указана вверху.</p>
        </Section>
      </main>
      <Footer />
    </div>
  );
}
