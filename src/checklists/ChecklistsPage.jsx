import { useEffect, useMemo, useRef, useState } from 'react';
import { Navbar, Footer } from '../components/SiteChrome';
import { CHECKLISTS, CAT_INFO } from './data';
import { wireframe } from './wireframes';
import './wireframes.css';

export const CHECKLISTS_FAQ = [
  {
    q: 'Что такое чек-лист в тестировании?',
    a: 'Список проверок без пошаговых шагов и ожидаемых результатов, в отличие от тест-кейса. Подходит для быстрых регрессионных и смоук-проверок, когда тестировщик понимает продукт.'
  },
  {
    q: 'Чем чек-лист отличается от тест-кейса?',
    a: 'Тест-кейс описывает шаги, данные и ожидаемый результат. Чек-лист фиксирует только «что проверить». Он короче, его быстрее поддерживать, но он требует от исполнителя больше контекста.'
  },
  {
    q: 'Можно ли использовать чек-листы в работе и на собеседовании?',
    a: 'Да, они бесплатные. Берите их в свои проекты, адаптируйте под требования и используйте как основу для тестового задания.'
  },
  {
    q: 'Как часто обновляются чек-листы?',
    a: 'По мере того как в реальных проектах находятся новые типовые баги. Дата обновления указана на странице каждого чек-листа.'
  }
];

const HOW = [
  ['Найдите компонент', 'Через поиск или по группе. Синонимы тоже работают: «инпут», «дропдаун», «чекаут».'],
  ['Пройдите проверки', 'Отмечайте пункты прямо на странице — прогресс сохранится в браузере.'],
  ['Заберите к себе', 'Скопируйте в TMS, Google Таблицы или Jira — без регистрации.'],
  ['Автоматизируйте', 'Типовые проверки легко превратить в автотесты на Playwright или pytest.']
];

const CATS = [...new Set(CHECKLISTS.map(c => c.cat))];
const READY = CHECKLISTS.filter(c => !c.soon);

const plural = (x, forms) => {
  const a = x % 10, b = x % 100;
  return forms[(a === 1 && b !== 11) ? 0 : (a >= 2 && a <= 4 && (b < 10 || b >= 20)) ? 1 : 2];
};

// Ищем по началу слов; у русских слов отбрасываем окончание: «формы» найдёт «Форма»
function searchRe(text) {
  const words = text.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return null;
  return new RegExp('^' + words.map(w => {
    if (w.length >= 5 && /[а-яё]$/.test(w)) w = w.replace(/[аеиоуыэюяйь]+$/, '');
    return '(?=[\\s\\S]*(?:^|[^a-zа-яё0-9])' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')';
  }).join(''), 'i');
}
const haystack = c => [c.name, c.alias, c.desc, c.tags.join(' ')].join(' ');

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12.5 9 17.5 20 6.5" /></svg>
);
const Arrow = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

function ChecklistCard({ item, index }) {
  const body = (
    <>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(239, 93, 43, 0.12), transparent 70%)' }} />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/0 group-hover:via-orange-500/50 to-transparent transition-all duration-500" />
      <div className="wf" aria-hidden="true" dangerouslySetInnerHTML={{ __html: wireframe(item.wf) }} />
      <div className="relative flex flex-col flex-grow px-2 pt-4 pb-1.5">
        <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wider mb-2">
          <span className="font-mono">#{String(index).padStart(2, '0')}</span>{item.cat}
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-[#ef5d2b] transition-colors">{item.name}</h3>
        <p className="text-sm text-gray-400 line-clamp-3">{item.desc}</p>
        <div className="flex flex-wrap gap-1.5 mt-3.5">
          {item.tags.map(t => (
            <span key={t} className="text-xs text-gray-400 bg-white/[0.04] border border-white/5 rounded-full px-2.5 py-0.5">{t}</span>
          ))}
        </div>
        <div className="flex items-center justify-between gap-2 mt-auto pt-5">
          {item.soon ? (
            <span className="inline-flex items-center rounded-lg px-2.5 py-1 text-[13px] font-semibold bg-white/5 text-gray-500">Скоро</span>
          ) : (
            <>
              <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[13px] font-semibold bg-[#ef5d2b]/10 text-[#ef5d2b] whitespace-nowrap">
                <CheckIcon />{item.n} {plural(item.n, ['проверка', 'проверки', 'проверок'])}
              </span>
              <span className="inline-flex items-center gap-1.5 group-hover:gap-2.5 text-sm font-semibold text-gray-400 group-hover:text-[#ef5d2b] transition-all">
                Открыть<Arrow />
              </span>
            </>
          )}
        </div>
      </div>
    </>
  );
  const cls = 'group relative flex flex-col bg-[#141414] rounded-2xl border border-white/5 p-3 overflow-hidden transition-all duration-300';
  return item.soon ? (
    <article className={`${cls} opacity-60`} aria-label={`${item.name} — скоро`}>{body}</article>
  ) : (
    <a href={`/checklists/${item.slug}/`} className={`${cls} hover:-translate-y-1 hover:border-[#ef5d2b]/25 focus-visible:outline-none focus-visible:border-[#ef5d2b]/60`}>{body}</a>
  );
}

export default function ChecklistsPage() {
  const [query, setQuery] = useState('');
  const [activeCat, setActiveCat] = useState('all');
  const inputRef = useRef(null);

  useEffect(() => {
    const onKey = e => {
      const input = inputRef.current;
      if (e.key === '/' && document.activeElement !== input) { e.preventDefault(); input?.focus(); }
      if (e.key === 'Escape' && document.activeElement === input) setQuery('');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const re = useMemo(() => searchRe(query), [query]);
  const byQuery = useMemo(() => CHECKLISTS.filter(c => !re || re.test(haystack(c))), [re]);
  const groups = CATS
    .map(cat => ({ cat, list: byQuery.filter(c => c.cat === cat && (activeCat === 'all' || activeCat === cat)) }))
    .filter(g => g.list.length);
  const total = groups.reduce((s, g) => s + g.list.length, 0);
  const filtered = !!re || activeCat !== 'all';
  const checks = READY.reduce((s, c) => s + c.n, 0);

  return (
    <div className="font-sans antialiased text-white bg-[#0a0a0a] overflow-x-hidden selection:bg-[#ef5d2b] selection:text-white min-h-screen">
      <Navbar current="checklists" />

      <div className="absolute top-0 left-0 right-0 h-[1100px] overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute rounded-full blur-3xl w-[520px] h-[520px] bg-orange-500/10 top-10 -right-32" />
        <div className="absolute rounded-full blur-3xl w-[380px] h-[380px] bg-purple-500/[0.07] top-[360px] -left-36" />
      </div>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <nav aria-label="Хлебные крошки" className="flex gap-2 text-[13px] text-gray-500 pt-24 sm:pt-28">
          <a href="/" className="hover:text-white transition-colors">Главная</a><span>/</span><span>Чек-листы</span>
        </nav>

        <section className="pt-9 pb-8">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 border border-white/10 rounded-full text-[13px] text-gray-400">
            <i className="w-[7px] h-[7px] rounded-full bg-[#ef5d2b] shadow-[0_0_0_4px_rgba(239,93,43,0.2)]" />
            Бесплатно · от руководителя QA-отдела
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-[3.5rem] font-bold tracking-tight leading-tight mt-6 mb-5 max-w-4xl">
            Чек-листы тестирования <span className="text-[#ef5d2b]">для каждого компонента</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl">
            Найдите компонент — форму, фильтр, аккордеон, корзину или API — и откройте готовый чек-лист: что проверить, на каких данных и какие баги встречаются чаще всего.
          </p>

          <div className="relative max-w-[860px] mt-9 mb-4">
            <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 stroke-gray-400 fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Найти компонент: «форма», «аккордеон», «корзина»…"
              autoComplete="off"
              aria-label="Поиск компонента"
              className="w-full h-14 sm:h-16 bg-[#141414] border border-white/5 rounded-2xl pl-[54px] pr-24 text-base sm:text-[17px] text-white placeholder:text-gray-500 outline-none appearance-none transition-shadow focus:border-[#ef5d2b]/60 focus:shadow-[0_0_0_4px_rgba(239,93,43,0.12)] [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button type="button" onClick={() => { setQuery(''); inputRef.current?.focus(); }} aria-label="Очистить поиск" className="absolute right-[52px] top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-[#262626] text-white text-[13px]">✕</button>
            )}
            <kbd className="hidden sm:block absolute right-[18px] top-1/2 -translate-y-1/2 font-mono text-xs font-semibold text-gray-500 border border-white/10 rounded-md px-[7px] py-0.5">/</kbd>
          </div>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Группы компонентов">
            {[['all', 'Все'], ...CATS.map(c => [c, c])].map(([value, label]) => {
              const count = value === 'all' ? byQuery.length : byQuery.filter(c => c.cat === value).length;
              const on = activeCat === value;
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setActiveCat(value)}
                  className={`rounded-full px-[18px] py-[9px] text-sm font-medium border transition-colors ${on ? 'bg-white border-white text-[#0a0a0a]' : 'border-white/10 text-gray-400 hover:text-white hover:border-white/25'}`}
                >
                  {label}<b className={`ml-1.5 font-semibold ${on ? 'text-[#ef5d2b]' : 'text-gray-500'}`}>{count}</b>
                </button>
              );
            })}
          </div>
          <div className="mt-4 min-h-6 text-[15px] text-gray-400" aria-live="polite">
            {filtered && total > 0 && <>Найдено <b className="text-white">{total}</b> {plural(total, ['чек-лист', 'чек-листа', 'чек-листов'])}</>}
          </div>

          <div className="grid grid-cols-3 sm:flex gap-2 sm:gap-3 mt-9">
            {[[READY.length, 'чек-листов'], [checks, 'проверок'], [CATS.length, 'групп компонентов']].map(([v, l]) => (
              <div key={l} className="bg-[#141414] border border-white/5 rounded-2xl p-3.5 sm:px-[22px] sm:py-4 sm:min-w-[170px]">
                <b className="block text-2xl sm:text-3xl font-bold tracking-tight leading-tight">{v}</b>
                <span className="block text-[10.5px] sm:text-xs uppercase tracking-wider text-gray-500 leading-snug">{l}</span>
              </div>
            ))}
          </div>
        </section>

        {groups.map(({ cat, list }) => (
          <section key={cat} className="pt-14 pb-2">
            <div className="flex items-baseline gap-3.5 flex-wrap mb-6">
              <h2 className="text-[26px] sm:text-4xl font-bold tracking-tight">{cat}</h2>
              <span className="text-[26px] sm:text-4xl font-bold text-gray-600">{list.length}</span>
              {CAT_INFO[cat] && <p className="basis-full text-gray-400 mt-0.5">{CAT_INFO[cat]}</p>}
            </div>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(290px,1fr))]">
              {list.map(item => <ChecklistCard key={item.slug} item={item} index={CHECKLISTS.indexOf(item) + 1} />)}
            </div>
          </section>
        ))}
        {total === 0 && (
          <p className="text-center py-20 text-gray-400">Такого чек-листа пока нет. Попробуйте другое слово — или напишите мне, какой компонент добавить.</p>
        )}

        <section className="relative bg-[#141414] border border-white/5 rounded-2xl sm:rounded-[28px] px-5 py-8 sm:px-12 sm:py-14 mt-[72px]">
          <span className="text-sm font-semibold text-[#ef5d2b] uppercase tracking-widest">Как пользоваться</span>
          <h2 className="text-[26px] sm:text-4xl font-bold tracking-tight max-w-2xl mt-2.5">
            Чек-лист — не замена мышлению, а <span className="text-[#ef5d2b]">страховка от пропусков</span>
          </h2>
          <div className="grid gap-3 mt-8 grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
            {HOW.map(([title, text], i) => (
              <div key={title} className="bg-[#0f0f0f] border border-white/5 rounded-2xl p-[22px]">
                <span className="inline-grid place-items-center w-8 h-8 rounded-[10px] bg-[#ef5d2b]/10 text-[#ef5d2b] font-bold mb-3.5">{i + 1}</span>
                <b className="block text-lg mb-2">{title}</b>
                <p className="text-sm text-gray-400">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-between gap-6 flex-wrap mt-4 rounded-2xl sm:rounded-[28px] px-5 py-8 sm:px-12 sm:py-10 border border-[#ef5d2b]/20 bg-[linear-gradient(135deg,rgba(239,93,43,0.18),rgba(168,85,247,0.08)),#141414]">
          <div>
            <h2 className="text-[22px] sm:text-[30px] font-bold tracking-tight max-w-2xl">Хотите не только проверять по чек-листу, но и писать свои?</h2>
            <p className="text-gray-400 mt-2 max-w-2xl">В курсе «Тестирование веб-приложений» разбираем техники тест-дизайна на реальном проекте — с ИИ-помощником.</p>
          </div>
          <a href="https://stepik.org/a/254843" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#ef5d2b] hover:bg-[#ff7a4a] transition-colors text-white text-sm font-semibold px-6 py-3 rounded-full">
            Взять этот ключ<Arrow />
          </a>
        </section>

        <section className="pt-[72px] max-w-[860px]">
          <span className="text-sm font-semibold text-[#ef5d2b] uppercase tracking-widest">FAQ</span>
          <h2 className="text-[26px] sm:text-4xl font-bold tracking-tight mt-2.5 mb-6">Частые вопросы</h2>
          {CHECKLISTS_FAQ.map(({ q, a }) => (
            <details key={q} className="group border-b border-white/5 py-[18px]">
              <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer font-semibold text-[17px] flex justify-between gap-4">
                {q}<span className="text-[#ef5d2b] text-[22px] leading-none transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="text-gray-400 mt-3">{a}</p>
            </details>
          ))}
        </section>
      </main>

      <div className="mt-[72px]"><Footer /></div>
    </div>
  );
}

// Микроразметка для поисковиков и нейросетей: крошки, список чек-листов, FAQ
export function checklistsJsonLd(base = 'https://denis-timoshin.ru') {
  return [
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Главная', item: `${base}/` },
        { '@type': 'ListItem', position: 2, name: 'Чек-листы', item: `${base}/checklists/` }
      ]
    },
    {
      '@context': 'https://schema.org', '@type': 'ItemList', name: 'Чек-листы тестирования по компонентам',
      itemListElement: READY.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: `Чек-лист: ${c.name}`, url: `${base}/checklists/${c.slug}/` }))
    },
    {
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: CHECKLISTS_FAQ.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }))
    }
  ];
}
