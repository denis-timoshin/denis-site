import { useEffect, useMemo, useState } from 'react';
import { Navbar, Footer } from '../components/SiteChrome';
import { CHECKLISTS } from './data';
import { countChecks } from './content/index.js';

const SITE = 'https://denis-timoshin.ru';

const TYPES = {
  pos: { label: 'Позитивная', cls: 'text-emerald-400 bg-emerald-400/10' },
  neg: { label: 'Негативная', cls: 'text-rose-400 bg-rose-400/10' },
  req: { label: 'Требование', cls: 'text-sky-400 bg-sky-400/10' },
};
const FILTERS = [['all', 'Все'], ['pos', 'Позитивные'], ['neg', 'Негативные'], ['req', 'Требования']];

const plural = (x, forms) => {
  const a = x % 10, b = x % 100;
  return forms[(a === 1 && b !== 11) ? 0 : (a >= 2 && a <= 4 && (b < 10 || b >= 20)) ? 1 : 2];
};
const checksWord = n => `${n} ${plural(n, ['проверка', 'проверки', 'проверок'])}`;
const formatDate = iso => new Date(iso + 'T00:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

// Ключ пункта: раздел + порядковый номер внутри раздела
const itemKey = (sectionId, i) => `${sectionId}-${i}`;

const storage = {
  get(key) { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* приватный режим — прогресс просто не сохранится */ } },
};

// Таблица для Google Таблиц / Excel / TMS
function toRows(content, done) {
  const rows = [['№', 'Раздел', 'Поле', 'Тип', 'Проверка', 'Пример данных', 'Статус']];
  let n = 0;
  for (const s of content.sections) {
    s.items.forEach((it, i) => {
      rows.push([++n, s.title, it.field || '', TYPES[it.type].label, it.t, it.ex || '', done.has(itemKey(s.id, i)) ? 'Пройдено' : '']);
    });
  }
  return rows;
}

function CopyChip({ value }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch { /* буфер недоступен — значение всё равно видно и выделяется */ }
  };
  return (
    <button
      type="button"
      onClick={copy}
      title="Скопировать пример"
      className="group/chip inline-flex max-w-full items-start gap-1.5 text-left rounded-md bg-white/[0.04] border border-white/5 hover:border-[#ef5d2b]/40 px-2 py-0.5 font-mono text-[13px] text-gray-300 transition-colors"
    >
      <span className="break-all whitespace-pre-wrap">{value}</span>
      <span className={`shrink-0 text-[11px] font-sans font-semibold pt-px ${copied ? 'text-[#ef5d2b]' : 'text-gray-600 group-hover/chip:text-gray-400'}`}>
        <span className="hidden sm:inline">{copied ? 'скопировано' : 'копировать'}</span>
        <span className="sm:hidden" aria-hidden="true">{copied ? '✓' : '⧉'}</span>
      </span>
    </button>
  );
}

function ItemRow({ item, checked, onToggle, id }) {
  const type = TYPES[item.type];
  return (
    <li className={`flex gap-3 sm:gap-4 py-3.5 border-b border-white/5 last:border-0 transition-opacity ${checked ? 'opacity-50' : ''}`}>
      <span className="relative mt-0.5 w-5 h-5 shrink-0">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className="peer absolute inset-0 w-5 h-5 cursor-pointer appearance-none rounded-md border-[1.5px] border-white/20 bg-[#0f0f0f] checked:bg-[#ef5d2b] checked:border-[#ef5d2b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef5d2b]/50"
        />
        <svg viewBox="0 0 24 24" className="absolute inset-0 m-auto w-3.5 h-3.5 pointer-events-none opacity-0 peer-checked:opacity-100" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5 10 17.5 19 7" /></svg>
      </span>
      <div className="flex-1 min-w-0">
        <label htmlFor={id} className={`block cursor-pointer text-[15px] sm:text-base text-gray-100 ${checked ? 'line-through decoration-white/30' : ''}`}>
          {item.t}
        </label>
        {item.ex && <div className="mt-1.5"><CopyChip value={item.ex} /></div>}
      </div>
      <span className={`self-start shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${type.cls}`}>
        <span className="hidden sm:inline">{type.label}</span>
        <span className="sm:hidden">{type.label.slice(0, 3)}</span>
      </span>
    </li>
  );
}

function Spec({ spec }) {
  return (
    <details className="group mt-5 rounded-2xl border border-[#ef5d2b]/20 bg-[#ef5d2b]/[0.04]">
      <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer flex items-center justify-between gap-4 px-5 py-4 font-semibold">
        <span>📐 {spec.title}</span>
        <span className="text-[#ef5d2b] text-xl leading-none transition-transform group-open:rotate-45">+</span>
      </summary>
      <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2 px-5 pb-5">
        {spec.blocks.map(b => (
          <div key={b.h}>
            <b className="block text-sm text-white mb-2">{b.h}</b>
            <ul className="space-y-1.5">
              {b.li.map(li => (
                <li key={li} className="flex gap-2 text-sm text-gray-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ef5d2b] shrink-0 mt-1.5" />{li}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </details>
  );
}

export default function ChecklistDetail({ content }) {
  const storageKey = `checklist:${content.slug}`;
  const total = countChecks(content);
  const [done, setDone] = useState(() => new Set());
  const [filter, setFilter] = useState('all');
  const [hideDone, setHideDone] = useState(false);
  const [notice, setNotice] = useState('');

  // Прогресс читаем после гидратации, чтобы серверная и клиентская разметка совпали
  useEffect(() => { setDone(new Set(storage.get(storageKey))); }, [storageKey]);
  useEffect(() => { document.title = content.title + ' — Денис Тимошин'; }, [content.title]);

  const update = next => { setDone(next); storage.set(storageKey, [...next]); };
  const toggle = key => {
    const next = new Set(done);
    if (next.has(key)) next.delete(key); else next.add(key);
    update(next);
  };
  const flash = text => { setNotice(text); setTimeout(() => setNotice(''), 1800); };

  const copyTable = async () => {
    const tsv = toRows(content, done).map(r => r.map(c => String(c).replace(/[\t\n]/g, ' ')).join('\t')).join('\n');
    try { await navigator.clipboard.writeText(tsv); flash('Таблица скопирована — вставьте в Google Таблицы или Excel'); }
    catch { flash('Не удалось скопировать — скачайте CSV'); }
  };
  const downloadCsv = () => {
    const csv = toRows(content, done).map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: `checklist-${content.slug}.csv` });
    a.click();
    URL.revokeObjectURL(url);
  };
  const reset = () => { if (done.size && confirm('Снять все отметки?')) update(new Set()); };

  const sections = useMemo(() => content.sections.map(s => ({
    ...s,
    rows: s.items
      .map((item, i) => ({ item, key: itemKey(s.id, i) }))
      .filter(({ item }) => filter === 'all' || item.type === filter),
  })), [content, filter]);

  const doneCount = done.size;
  const pct = Math.round(doneCount / total * 100);
  const base = content.basedOn && CHECKLISTS.find(c => c.slug === content.basedOn);
  const related = (content.related || []).map(slug => CHECKLISTS.find(c => c.slug === slug)).filter(Boolean);

  return (
    <div className="font-sans antialiased text-white bg-[#0a0a0a] overflow-x-clip selection:bg-[#ef5d2b] selection:text-white min-h-screen">
      <Navbar current="checklists" />

      <div className="absolute top-0 left-0 right-0 h-[900px] overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute rounded-full blur-3xl w-[520px] h-[520px] bg-orange-500/10 top-10 -right-32" />
        <div className="absolute rounded-full blur-3xl w-[380px] h-[380px] bg-purple-500/[0.07] top-[360px] -left-36" />
      </div>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <nav aria-label="Хлебные крошки" className="flex flex-wrap gap-2 text-[13px] text-gray-500 pt-24 sm:pt-28">
          <a href="/" className="hover:text-white transition-colors">Главная</a><span>/</span>
          <a href="/checklists/" className="hover:text-white transition-colors">Чек-листы</a><span>/</span>
          <span>{content.name}</span>
        </nav>

        <header className="pt-8 pb-6 max-w-4xl">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 border border-white/10 rounded-full text-[13px] text-gray-400">
            <i className="w-[7px] h-[7px] rounded-full bg-[#ef5d2b] shadow-[0_0_0_4px_rgba(239,93,43,0.2)]" />
            {checksWord(total)} · обновлено <time dateTime={content.updated}>{formatDate(content.updated)}</time>
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-[3.25rem] font-bold tracking-tight leading-tight mt-6 mb-5">
            {content.h1}
          </h1>
          <p className="text-gray-400 text-lg max-w-3xl">{content.lead}</p>
          {base && (
            <a href={`/checklists/${base.slug}/`} className="group inline-flex items-center gap-3 mt-5 rounded-xl border border-white/10 hover:border-[#ef5d2b]/40 px-4 py-2.5 text-sm text-gray-300 transition-colors">
              <span>Валидация полей — в чек-листе <b className="text-white group-hover:text-[#ef5d2b] transition-colors">«{base.name}»</b></span>
              <span className="text-[#ef5d2b]">→</span>
            </a>
          )}
          <div className="flex items-center gap-3 mt-6 text-sm text-gray-400">
            <img src="/timoshin_logo.png" alt="" className="w-9 h-9 object-contain" />
            <span><b className="text-white font-semibold">Денис Тимошин</b> · руководитель отдела QA в Kokoc.tech</span>
          </div>
        </header>

        {/* Панель: прогресс, фильтры, выгрузка */}
        <div className="relative sm:sticky sm:top-20 z-30 -mx-4 sm:mx-0 px-4 sm:px-5 py-3 bg-[#0a0a0a]/90 backdrop-blur-xl border-y sm:border border-white/5 sm:rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={doneCount} aria-label="Пройдено проверок">
              <div className="h-full bg-[#ef5d2b] transition-[width] duration-300" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-sm text-gray-400 whitespace-nowrap"><b className="text-white">{doneCount}</b> / {total}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {FILTERS.map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
                className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium border transition-colors ${filter === value ? 'bg-white border-white text-[#0a0a0a]' : 'border-white/10 text-gray-400 hover:text-white hover:border-white/25'}`}
              >
                {label}
              </button>
            ))}
            <label className="inline-flex items-center gap-2 text-[13px] text-gray-400 cursor-pointer ml-1">
              <input type="checkbox" checked={hideDone} onChange={e => setHideDone(e.target.checked)} className="accent-[#ef5d2b]" />
              Скрыть пройденные
            </label>
            <div className="flex flex-wrap gap-2 sm:ml-auto w-full sm:w-auto">
              <button type="button" onClick={copyTable} className="rounded-full px-3.5 py-1.5 text-[13px] font-semibold bg-[#ef5d2b] hover:bg-[#ff7a4a] transition-colors">Копировать таблицей</button>
              <button type="button" onClick={downloadCsv} className="rounded-full px-3.5 py-1.5 text-[13px] font-semibold bg-white/5 hover:bg-white/10 transition-colors">CSV</button>
              <button type="button" onClick={reset} className="rounded-full px-3.5 py-1.5 text-[13px] text-gray-500 hover:text-white transition-colors">Сбросить</button>
            </div>
          </div>
          <div className="text-[13px] text-[#ef5d2b] min-h-0" aria-live="polite">{notice && <p className="mt-2">{notice}</p>}</div>
        </div>

        <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-10 mt-8">
          {/* Оглавление */}
          <aside className="hidden lg:block">
            <nav aria-label="Разделы чек-листа" className="sticky top-[200px] space-y-0.5">
              {content.sections.map(s => {
                const sDone = s.items.filter((_, i) => done.has(itemKey(s.id, i))).length;
                const full = sDone === s.items.length;
                return (
                  <a key={s.id} href={`#${s.id}`} className="flex items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                    <span className="truncate"><span className="mr-2">{s.icon}</span>{s.title}</span>
                    <span className={`text-xs tabular-nums ${full ? 'text-[#ef5d2b]' : 'text-gray-600'}`}>{sDone}/{s.items.length}</span>
                  </a>
                );
              })}
            </nav>
          </aside>

          <div className="min-w-0">
            {sections.map(s => {
              const rows = hideDone ? s.rows.filter(r => !done.has(r.key)) : s.rows;
              let lastField;
              return (
                <section key={s.id} id={s.id} className="scroll-mt-[220px] mb-6 bg-[#141414] border border-white/5 rounded-2xl px-4 sm:px-6 pt-5 sm:pt-6 pb-2">
                  <h2 className="flex items-baseline gap-3 text-xl sm:text-2xl font-bold tracking-tight">
                    <span><span className="mr-2.5">{s.icon}</span>{s.title}</span>
                    <span className="text-gray-600 text-lg">{s.items.length}</span>
                  </h2>
                  {s.intro && <p className="text-gray-400 text-sm mt-1.5">{s.intro}</p>}
                  {s.spec && <Spec spec={s.spec} />}
                  <ul className="mt-3">
                    {rows.map(({ item, key }) => {
                      const showField = item.field && item.field !== lastField;
                      lastField = item.field;
                      return [
                        showField && <li key={key + '-field'} className="pt-4 pb-1 text-xs font-semibold uppercase tracking-widest text-[#ef5d2b]">{item.field}</li>,
                        <ItemRow key={key} id={`c-${key}`} item={item} checked={done.has(key)} onToggle={() => toggle(key)} />,
                      ];
                    })}
                    {!rows.length && <li className="py-4 text-sm text-gray-500">В этом разделе всё отфильтровано.</li>}
                  </ul>
                </section>
              );
            })}

            <section className="flex items-center justify-between gap-6 flex-wrap mt-10 rounded-2xl px-5 py-8 sm:px-10 sm:py-9 border border-[#ef5d2b]/20 bg-[linear-gradient(135deg,rgba(239,93,43,0.18),rgba(168,85,247,0.08)),#141414]">
              <div>
                <h2 className="text-[22px] sm:text-[28px] font-bold tracking-tight max-w-xl">Хотите составлять такие чек-листы сами?</h2>
                <p className="text-gray-400 mt-2 max-w-xl">В курсе «Тестирование веб-приложений» разбираем техники тест-дизайна на реальном проекте — с ИИ-помощником.</p>
              </div>
              <a href="https://stepik.org/a/254843" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#ef5d2b] hover:bg-[#ff7a4a] transition-colors text-white text-sm font-semibold px-6 py-3 rounded-full">
                Взять этот ключ →
              </a>
            </section>

            {related.length > 0 && (
              <section className="mt-14">
                <h2 className="text-2xl font-bold tracking-tight mb-5">Похожие чек-листы</h2>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {related.map(r => (
                    <a key={r.slug} href={`/checklists/${r.slug}/`} className="group flex flex-col bg-[#141414] border border-white/5 hover:border-[#ef5d2b]/25 rounded-2xl p-5 transition-colors">
                      <span className="text-xs uppercase tracking-wider text-gray-500">{r.cat}</span>
                      <b className="text-lg mt-1 group-hover:text-[#ef5d2b] transition-colors">{r.name}</b>
                      <span className="text-sm text-gray-400 mt-1 line-clamp-2">{r.desc}</span>
                    </a>
                  ))}
                </div>
                <a href="/checklists/" className="inline-flex mt-6 text-sm font-semibold text-gray-400 hover:text-[#ef5d2b] transition-colors">← Все чек-листы</a>
              </section>
            )}
          </div>
        </div>
      </main>

      <div className="mt-[72px]"><Footer /></div>
    </div>
  );
}

// Микроразметка: крошки + статья с автором
export function detailJsonLd(content) {
  const url = `${SITE}/checklists/${content.slug}/`;
  return [
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Главная', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: 'Чек-листы', item: `${SITE}/checklists/` },
        { '@type': 'ListItem', position: 3, name: content.name, item: url },
      ]
    },
    {
      '@context': 'https://schema.org', '@type': 'Article',
      headline: content.title, description: content.description, url,
      inLanguage: 'ru', dateModified: content.updated,
      author: { '@type': 'Person', name: 'Денис Тимошин', url: `${SITE}/`, jobTitle: 'Руководитель отдела QA' },
      publisher: { '@type': 'Person', name: 'Денис Тимошин', url: `${SITE}/` },
      image: `${SITE}/timoshin_it_key.jpg`,
      articleSection: content.sections.map(s => s.title),
    }
  ];
}
