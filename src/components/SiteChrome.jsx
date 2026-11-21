import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getConsent, setConsent, onConsentChange } from '../consent';
import { initAnalytics } from '../analytics';

// Шапка и подвал общие для всех страниц сайта.
// home — главная: пункты меню плавно прокручивают к секциям.
// На остальных страницах это обычные ссылки на секции главной.

const SECTION_LINKS = [
  { label: 'Обо мне', href: '#about' },
  { label: 'Курсы', href: '#courses' },
  { label: 'Отзывы', href: '#reviews' },
  { label: 'Контакты', href: '#contact' }
];

const CHECKLISTS_HREF = '/checklists/';
export const PRIVACY_HREF = '/privacy/';

// Ссылка на страницу, где посетитель уже находится, не перезагружает её, а прокручивает наверх
function stayOnPage(e, href, onDone) {
  if (window.location.pathname !== href) return;
  e.preventDefault();
  onDone?.();
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
}

export function Navbar({ home = false, current }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [mobileOpen]);

  const scrollTo = (href) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // На главной — кнопка с прокруткой, на других страницах — ссылка на секцию главной
  const SectionLink = ({ href, className, children }) =>
    home ? (
      <button onClick={() => scrollTo(href)} className={className}>{children}</button>
    ) : (
      <a href={`/${href}`} className={className}>{children}</a>
    );

  const desktopLink = 'relative text-sm font-medium text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-full hover:bg-white/5';
  const mobileLink = 'text-xl font-semibold text-gray-200 hover:text-white py-3 px-4 rounded-xl hover:bg-white/5 transition-all text-left';
  const isChecklists = current === 'checklists';

  return (
    <>
      <motion.nav
        // Въезд шапки только на главной: остальные страницы пре-рендерятся,
        // и стартовая позиция анимации (за экраном) попала бы в готовый HTML
        initial={home ? { y: -100 } : false}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 h-16 sm:h-20 py-3 sm:py-4 transition-all duration-300 ${
          scrolled
            ? 'bg-[#0a0a0a]/90 backdrop-blur-xl shadow-[0_1px_0_rgba(255,255,255,0.05)]'
            : 'bg-[#0a0a0a]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <a href={home ? '#' : '/'} className="flex items-center gap-3 group">
            <div className="relative">
              <img
                src={`${import.meta.env.BASE_URL}timoshin_logo.png`}
                alt="Денис Тимошин"
                className="w-10 h-10 object-contain transition-transform group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-orange-500/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white hidden sm:block">
              Денис <span className="text-[#ef5d2b]">Тимошин</span>
            </span>
          </a>

          <div className="hidden md:flex items-center gap-1">
            {SECTION_LINKS.map(link => (
              <SectionLink key={link.href} href={link.href} className={desktopLink}>
                {link.label}
              </SectionLink>
            ))}
            <a
              href={CHECKLISTS_HREF}
              onClick={e => stayOnPage(e, CHECKLISTS_HREF)}
              aria-current={isChecklists ? 'page' : undefined}
              className={`${desktopLink} ${isChecklists ? 'text-white bg-white/5' : ''}`}
            >
              Чек-листы
            </a>
            {home ? (
              <motion.button
                onClick={() => scrollTo('#contact')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="ml-4 relative bg-[#ef5d2b] text-white text-sm font-semibold px-6 py-2.5 rounded-full overflow-hidden group"
              >
                <span className="relative z-10">Узнать больше</span>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            ) : (
              <a
                href="/#courses"
                className="ml-4 relative bg-[#ef5d2b] text-white text-sm font-semibold px-6 py-2.5 rounded-full overflow-hidden group"
              >
                <span className="relative z-10">Курсы по QA</span>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Открыть меню"
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors shrink-0"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 5H17M3 10H17M3 15H17" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </motion.nav>

     <AnimatePresence>
      {mobileOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
            className="fixed right-0 top-0 bottom-0 w-80 bg-[#111111]/95 backdrop-blur-xl border-l border-white/10 z-50 p-8"
          >
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Закрыть меню"
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-white hover:bg-white/10"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 5L15 15M15 5L5 15" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <div className="flex flex-col gap-2 mt-20">
              {SECTION_LINKS.map((link) => (
                <SectionLink key={link.href} href={link.href} className={mobileLink}>
                  {link.label}
                </SectionLink>
              ))}
              <a href={CHECKLISTS_HREF} onClick={e => stayOnPage(e, CHECKLISTS_HREF, () => setMobileOpen(false))} className={mobileLink}>Чек-листы</a>
              {home ? (
                <button
                  onClick={() => scrollTo('#contact')}
                  className="bg-[#ef5d2b] text-white text-center font-semibold px-6 py-4 rounded-full mt-6 hover:bg-[#ff7a4a] transition-all"
                >
                  Узнать больше
                </button>
              ) : (
                <a
                  href="/#courses"
                  className="bg-[#ef5d2b] text-white text-center font-semibold px-6 py-4 rounded-full mt-6 hover:bg-[#ff7a4a] transition-all"
                >
                  Курсы по QA
                </a>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  );
}

// Плашка cookie. Показывается, пока посетитель не выбрал «Принять» или «Отказаться».
// Рисуется только в браузере (после гидратации), поэтому в пре-рендеренном HTML её нет.
function CookieBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(getConsent() === null);
    const offAnalytics = initAnalytics();
    const offConsent = onConsentChange(value => setOpen(value === null));
    return () => { offAnalytics(); offConsent(); };
  }, []);

  if (!open) return null;
  return (
    <div
      role="region"
      aria-label="Уведомление о cookie"
      className="fixed z-40 left-3 right-3 bottom-3 sm:left-6 sm:right-auto sm:bottom-6 sm:max-w-md bg-[#141414]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)] pb-[max(1rem,env(safe-area-inset-bottom))]"
    >
      <p className="text-sm text-gray-300 leading-relaxed">
        Сайт использует cookie и Яндекс Метрику, чтобы считать посещения и улучшать материалы.
        Подробнее — в <a href={PRIVACY_HREF} className="text-white underline underline-offset-2 decoration-white/30 hover:text-[#ef5d2b] hover:decoration-[#ef5d2b]">политике обработки персональных данных</a>.
      </p>
      <div className="flex gap-2 mt-4">
        <button
          type="button"
          onClick={() => setConsent('accepted')}
          className="flex-1 sm:flex-none bg-[#ef5d2b] hover:bg-[#ff7a4a] transition-colors text-white text-sm font-semibold px-5 py-2.5 rounded-full"
        >
          Принять
        </button>
        <button
          type="button"
          onClick={() => setConsent('declined')}
          className="flex-1 sm:flex-none bg-white/5 hover:bg-white/10 transition-colors text-gray-300 text-sm font-semibold px-5 py-2.5 rounded-full"
        >
          Отказаться
        </button>
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <>
    <CookieBanner />
    <footer className="py-8 bg-[#0a0a0a] relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src={`${import.meta.env.BASE_URL}timoshin_logo.png`}
            alt="Денис Тимошин"
            className="w-8 h-8 object-contain"
          />
          <span className="text-sm text-gray-600">© 2026 Денис Тимошин</span>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-600">
          <a href={CHECKLISTS_HREF} onClick={e => stayOnPage(e, CHECKLISTS_HREF)} className="hover:text-white transition-colors">Чек-листы для тестировщика</a>
          <a href={PRIVACY_HREF} onClick={e => stayOnPage(e, PRIVACY_HREF)} className="hover:text-white transition-colors">Политика конфиденциальности</a>
          <span>Курсы IT без воды</span>
        </nav>
      </div>
    </footer>
    </>
  );
}
