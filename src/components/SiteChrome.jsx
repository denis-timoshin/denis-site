import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
              <a href={CHECKLISTS_HREF} className={mobileLink}>Чек-листы</a>
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

export function Footer() {
  return (
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
        <nav className="flex items-center gap-6 text-sm text-gray-600">
          <a href={CHECKLISTS_HREF} className="hover:text-white transition-colors">Чек-листы для тестировщика</a>
          <span>Курсы IT без воды</span>
        </nav>
      </div>
    </footer>
  );
}
