import { useState, useEffect, useRef, useCallback } from 'react';

/* ============================================================
   UznaikaBot — Landing Page
   Telegram-бот для создания психологического портрета
   ============================================================ */

// ===== DATA =====
const STATS = [
  { value: 30, label: 'вопросов', suffix: '' },
  { value: 3, label: 'блока', suffix: '' },
  { value: 1, label: 'AI-анализ', suffix: '', isAI: true },
  { value: 20, label: 'минут', suffix: '~', prefix: true },
];

const STEPS = [
  { emoji: '🚀', title: 'Запусти бота', desc: 'Открой @lessonWOWbot в Telegram и нажми /start' },
  { emoji: '📝', title: 'Ответь на 30 вопросов', desc: 'Метафоры, ценности, ситуации — 3 блока' },
  { emoji: '🤖', title: 'AI анализирует', desc: 'YandexGPT создаёт подробный портрет' },
  { emoji: '📧', title: 'Получи на email', desc: 'Развёрнутый психологический портрет' },
];

const QUESTION_BLOCKS = [
  {
    emoji: '🎭',
    title: 'Метафоры и самовосприятие',
    count: 10,
    color: 'from-purple-500 to-indigo-600',
    questions: [
      'Какое животное отражает твоё внутреннее состояние?',
      'Как называется текущая глава твоей жизни?',
      'Какое время года — твой характер?',
      'Какой цвет описывает тебя?',
      'Каким природным явлением ты бы был?',
      'Что тебя расслабляет?',
      'Твоя ахиллесова пята как супергероя?',
      'За что хочешь получить известность?',
      'Твой девиз?',
      'Стёр бы неприятное воспоминание?',
    ],
  },
  {
    emoji: '⚖️',
    title: 'Ценности и выбор',
    count: 9,
    color: 'from-cyan-500 to-blue-600',
    questions: [
      'Лотерея с условием — на кого потратишь?',
      'Какой закон хочешь отменить?',
      'Что хуже: предательство или равнодушие?',
      'Что добьёт в плохой день?',
      'Уйдёшь с плохого мастер-класса?',
      'Как извиняешься?',
      'Разбил чужую вещь — действия?',
      'Нашёл телефон в парке?',
      'Поссорился по глупости — что дальше?',
    ],
  },
  {
    emoji: '🔍',
    title: 'Ситуации и поведение',
    count: 10,
    color: 'from-pink-500 to-rose-600',
    questions: [
      'Когда проявились сильные качества?',
      'Что изменишь в школе?',
      'Кто-то потерялся в походе?',
      'Спор о мебели с другом?',
      'Неприятный гость напросился?',
      'Друг рассказывает историю в 3-й раз?',
      'Потерян багаж, трансфер не приехал?',
      'Роль в компании друзей?',
      'Какое место в школе ближе?',
      'На какого героя похож?',
    ],
  },
];

const FEATURES = [
  { emoji: '🎮', title: '30 глубоких вопросов', desc: '3 тематических блока: метафоры, ценности, ситуации' },
  { emoji: '🤖', title: 'AI-анализ', desc: 'YandexGPT создаёт подробный портрет личности' },
  { emoji: '📧', title: 'Результат на email', desc: 'Тип личности, сильные стороны, рекомендации' },
  { emoji: '💾', title: 'Автосохранение', desc: 'Можно продолжить в любой момент' },
  { emoji: '↩️', title: 'Навигация', desc: 'Вернуться к любому вопросу' },
  { emoji: '📊', title: 'Прогресс-бар', desc: 'Видно, сколько осталось' },
  { emoji: '💡', title: 'Подсказки', desc: 'Примеры к каждому вопросу' },
  { emoji: '🔒', title: 'Приватность', desc: 'Данные только для анализа, можно удалить' },
  { emoji: '🌟', title: 'Мотивация', desc: 'Поддерживающие сообщения в процессе' },
  { emoji: '⏱', title: '15-25 минут', desc: 'Комфортный темп прохождения' },
  { emoji: '📝', title: 'Экспорт данных', desc: 'Скачай свои ответы' },
  { emoji: '📩', title: 'Обратная связь', desc: 'Напиши разработчикам из бота' },
];

const RESULT_ITEMS = [
  { emoji: '🧬', text: 'Тип личности и общая характеристика' },
  { emoji: '💫', text: 'Эмоциональный профиль' },
  { emoji: '💪', text: 'Сильные стороны' },
  { emoji: '🌱', text: 'Области роста' },
  { emoji: '🗣', text: 'Стиль общения и поведение в конфликтах' },
  { emoji: '⚖️', text: 'Ценности и моральный компас' },
  { emoji: '🎯', text: 'Рекомендации для развития' },
];

const COMMANDS = [
  {
    category: '🎮 Тест',
    items: [
      { cmd: '/start', desc: 'начать тест' },
      { cmd: '/restart', desc: 'начать заново' },
      { cmd: '/resume', desc: 'продолжить' },
      { cmd: '/cancel', desc: 'отменить' },
      { cmd: '/status', desc: 'прогресс' },
      { cmd: '/question', desc: 'повтор вопроса' },
      { cmd: '/back', desc: 'назад' },
    ],
  },
  {
    category: '📝 Данные',
    items: [
      { cmd: '/mydata', desc: 'мои ответы' },
      { cmd: '/last_answer', desc: 'последний ответ' },
      { cmd: '/export_my_data', desc: 'экспорт' },
      { cmd: '/delete_my_data', desc: 'удалить все данные' },
    ],
  },
  {
    category: '💡 Подсказки',
    items: [
      { cmd: '/example', desc: 'пример ответа' },
      { cmd: '/why', desc: 'зачем этот вопрос' },
      { cmd: '/tips', desc: 'советы' },
      { cmd: '/motivate', desc: 'мотивация' },
    ],
  },
  {
    category: 'ℹ️ Информация',
    items: [
      { cmd: '/roadmap', desc: 'карта теста' },
      { cmd: '/faq', desc: 'частые вопросы' },
      { cmd: '/about', desc: 'о боте' },
      { cmd: '/privacy', desc: 'приватность' },
      { cmd: '/feedback', desc: 'обратная связь' },
      { cmd: '/id', desc: 'мой ID' },
      { cmd: '/ping', desc: 'проверка связи' },
    ],
  },
];

const FAQ_DATA = [
  { q: 'Сколько вопросов в тесте?', a: '30 вопросов в 3 блоках: метафоры, ценности, ситуации.' },
  { q: 'Сколько времени займёт?', a: '15-25 минут в спокойном темпе.' },
  { q: 'Нужно отвечать длинно?', a: 'Нет, главное — искренне. Даже 1-2 предложения достаточно.' },
  { q: 'Можно вернуться к вопросу?', a: 'Да, команда /back или кнопка ↩️.' },
  { q: 'Что если закрою Telegram?', a: 'Прогресс сохраняется автоматически, /resume продолжит.' },
  { q: 'Кто видит мои ответы?', a: 'Только AI для анализа. Можно удалить: /delete_my_data.' },
  { q: 'Можно пройти заново?', a: 'Да, команда /restart.' },
  { q: 'Куда приходит результат?', a: 'На email, который ты укажешь в конце теста.' },
  { q: 'Бот бесплатный?', a: 'Да, полностью бесплатный.' },
  { q: 'Кто разработчик?', a: 'Команда UznaikaDevs, канал: @uznaikadev.' },
];

const TESTIMONIALS = [
  { name: 'Алина', text: 'Удивительно точный портрет! Прямо в точку описали мой характер.', avatar: '👩‍💻' },
  { name: 'Дмитрий', text: 'Вопросы заставляют задуматься о себе. Очень интересный опыт!', avatar: '👨‍🎨' },
  { name: 'Марина', text: 'Рекомендую друзьям! Результат пришёл быстро и очень подробный.', avatar: '👩‍🔬' },
  { name: 'Артём', text: 'Не ожидал такой глубины от бота. AI впечатляет!', avatar: '👨‍💼' },
];

const NAV_LINKS = [
  { href: '#how', label: 'Как работает' },
  { href: '#questions', label: 'Вопросы' },
  { href: '#features', label: 'Возможности' },
  { href: '#commands', label: 'Команды' },
  { href: '#faq', label: 'FAQ' },
];

const ALL_QUESTIONS = QUESTION_BLOCKS.flatMap(b => b.questions);

// ===== HOOKS =====
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } }),
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    const children = el.querySelectorAll('.reveal');
    children.forEach(c => observer.observe(c));
    return () => children.forEach(c => observer.unobserve(c));
  }, []);
  return ref;
}

function useCounter(target: number, isVisible: boolean, duration = 1500) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [isVisible, target, duration]);
  return count;
}

// ===== COMPONENTS =====

/* ----- Scroll Progress Bar ----- */
function ScrollProgress() {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const scrollTop = document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setWidth(scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return <div className="scroll-progress" style={{ width: `${width}%` }} />;
}

/* ----- Scroll To Top ----- */
function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <button
      className={`scroll-top ${visible ? 'visible' : ''}`}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Наверх"
    >
      ↑
    </button>
  );
}

/* ----- Navbar ----- */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState('');

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
      const sections = NAV_LINKS.map(l => l.href.slice(1));
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.getBoundingClientRect().top <= 120) {
          setActive(sections[i]);
          break;
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#0F0F23]/80 backdrop-blur-xl shadow-lg shadow-purple-900/10' : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 text-lg sm:text-xl font-bold">
          <span className="text-2xl">🧠</span>
          <span className="gradient-text">UznaikaBot</span>
        </a>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8">
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors duration-200 hover:text-cyan-400 ${
                active === link.href.slice(1) ? 'text-cyan-400' : 'text-slate-300'
              }`}
            >
              {link.label}
            </a>
          ))}
          <a
            href="https://t.me/lessonWOWbot"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-sm font-semibold hover:from-purple-500 hover:to-indigo-500 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30"
          >
            🚀 Начать тест
          </a>
        </div>

        {/* Burger */}
        <button
          className="lg:hidden flex flex-col gap-1.5 p-2 -mr-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Меню"
        >
          <span className={`burger-line transition-all ${menuOpen ? 'rotate-45 translate-y-[5px]' : ''}`} />
          <span className={`burger-line transition-all ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`burger-line transition-all ${menuOpen ? '-rotate-45 -translate-y-[5px]' : ''}`} />
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 bg-[#0F0F23]/95 backdrop-blur-xl ${
          menuOpen ? 'max-h-[500px] border-t border-white/5' : 'max-h-0'
        }`}
      >
        <div className="px-4 py-4 flex flex-col gap-3">
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-slate-300 hover:text-cyan-400 py-2 text-base font-medium transition-colors"
            >
              {link.label}
            </a>
          ))}
          <a
            href="https://t.me/lessonWOWbot"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 px-5 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-center font-semibold hover:from-purple-500 hover:to-indigo-500 transition-all"
          >
            🚀 Начать тест
          </a>
        </div>
      </div>
    </header>
  );
}

/* ----- Floating Emojis ----- */
function FloatingEmojis() {
  const emojis = ['🧠', '🎭', '🔮', '✨', '💫', '🌟', '🎯', '💡'];
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {emojis.map((e, i) => (
        <span
          key={i}
          className="absolute text-2xl sm:text-3xl select-none"
          style={{
            left: `${10 + (i * 12) % 85}%`,
            top: `${15 + (i * 17) % 70}%`,
            animation: `floatEmoji ${4 + (i % 3) * 2}s ease-in-out ${i * 0.5}s infinite`,
            opacity: 0.4,
          }}
        >
          {e}
        </span>
      ))}
    </div>
  );
}

/* ----- Stars Background ----- */
function Stars() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: `${1 + Math.random() * 2}px`,
            height: `${1 + Math.random() * 2}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: 0.2 + Math.random() * 0.3,
            animation: `twinkle ${3 + Math.random() * 4}s ease-in-out ${Math.random() * 3}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ----- Stat Counter ----- */
function StatCounter({ stat, isVisible }: { stat: typeof STATS[0]; isVisible: boolean }) {
  const count = useCounter(stat.value, isVisible);
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-3xl sm:text-4xl font-bold gradient-text">
        {stat.prefix && stat.suffix}{stat.isAI ? '' : count}{stat.isAI ? 'AI' : ''}{!stat.prefix && stat.suffix}
      </span>
      <span className="text-xs sm:text-sm text-slate-400">{stat.label}</span>
    </div>
  );
}

/* ----- Typewriter ----- */
function Typewriter({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i <= text.length) {
        setDisplayed(text.slice(0, i));
        i++;
      } else {
        setDone(true);
        clearInterval(timer);
      }
    }, 50);
    return () => clearInterval(timer);
  }, [text]);
  return (
    <span>
      {displayed}
      {!done && <span className="typewriter-cursor" />}
    </span>
  );
}

/* ----- Hero Section ----- */
function HeroSection() {
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) setStatsVisible(true); },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center animated-gradient overflow-hidden pt-20">
      <FloatingEmojis />
      {/* Gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px]" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyan-500/15 rounded-full blur-[128px]" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center py-12 sm:py-20">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-slate-300 mb-6 sm:mb-8">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Telegram Bot
        </div>

        {/* Title */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-4 sm:mb-6 tracking-tight">
          <span className="gradient-text">UznaikaBot</span>
        </h1>
        <p className="text-xl sm:text-2xl md:text-3xl text-slate-200 font-semibold mb-4 sm:mb-6 min-h-[2em]">
          <Typewriter text="Узнай себя через метафоры" />
        </p>
        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed">
          Telegram-бот для создания глубокого психологического портрета.
          <br className="hidden sm:block" />
          <span className="text-cyan-400 font-medium">30 вопросов</span> →{' '}
          <span className="text-purple-400 font-medium">AI-анализ</span> →{' '}
          <span className="text-pink-400 font-medium">Подробный портрет на email</span>
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 sm:mb-16">
          <a
            href="https://t.me/lessonWOWbot"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-lg font-bold hover:from-purple-500 hover:to-indigo-500 transition-all duration-300 pulse-cta hover:scale-105 text-center min-h-[52px]"
          >
            🚀 Начать тест
          </a>
          <a
            href="https://t.me/uznaikadev"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-4 rounded-full glass text-lg font-semibold hover:bg-white/10 transition-all duration-300 hover:scale-105 text-center min-h-[52px]"
          >
            📢 Наш канал
          </a>
        </div>

        {/* Stats */}
        <div ref={statsRef} className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 max-w-lg sm:max-w-2xl mx-auto">
          {STATS.map((s, i) => (
            <StatCounter key={i} stat={s} isVisible={statsVisible} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----- How It Works ----- */
function HowItWorks() {
  const ref = useScrollReveal();
  return (
    <section id="how" className="relative py-20 sm:py-28 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[200px]" />
      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16 reveal">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Как это <span className="gradient-text">работает</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Всего 4 простых шага до твоего психологического портрета
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {STEPS.map((step, i) => (
            <div
              key={i}
              className={`reveal reveal-delay-${i + 1} glass card-lift p-6 sm:p-8 text-center relative`}
            >
              {/* Step number */}
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-sm font-bold">
                {i + 1}
              </div>
              <div className="text-4xl sm:text-5xl mb-4">{step.emoji}</div>
              <h3 className="text-lg sm:text-xl font-bold mb-2">{step.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
              {/* Connector line */}
              {i < 3 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-purple-500/50 to-transparent" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----- Question Blocks ----- */
function QuestionBlocks() {
  const ref = useScrollReveal();
  const [flippedBlock, setFlippedBlock] = useState<number | null>(null);

  return (
    <section id="questions" className="relative py-20 sm:py-28 overflow-hidden">
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[200px]" />
      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16 reveal">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Три блока <span className="gradient-text">вопросов</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Каждый блок раскрывает тебя с разных сторон
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {QUESTION_BLOCKS.map((block, i) => (
            <div
              key={i}
              className={`reveal reveal-delay-${i + 1}`}
              style={{ minHeight: '380px' }}
            >
              {/* Mobile: toggle on click; Desktop: hover */}
              <div
                className="flip-card w-full h-full cursor-pointer"
                onClick={() => setFlippedBlock(flippedBlock === i ? null : i)}
                style={{ minHeight: '380px' }}
              >
                <div
                  className="flip-card-inner w-full"
                  style={{
                    minHeight: '380px',
                    transform: flippedBlock === i ? 'rotateY(180deg)' : undefined,
                  }}
                >
                  {/* Front */}
                  <div className="flip-card-front glass p-6 sm:p-8 flex flex-col items-center justify-center text-center h-full" style={{ minHeight: '380px' }}>
                    <div className="text-5xl sm:text-6xl mb-4">{block.emoji}</div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-2">{block.title}</h3>
                    <p className="text-slate-400 mb-4">{block.count} вопросов</p>
                    <div className={`w-full h-1.5 rounded-full bg-gradient-to-r ${block.color} opacity-50`} />
                    <p className="text-xs text-slate-500 mt-4">Нажми, чтобы увидеть вопросы →</p>
                  </div>
                  {/* Back */}
                  <div className="flip-card-back glass p-5 sm:p-6 flex flex-col justify-center" style={{ minHeight: '380px' }}>
                    <h4 className="text-sm font-bold text-cyan-400 mb-3">{block.emoji} {block.title}</h4>
                    <ul className="space-y-1.5">
                      {block.questions.map((q, qi) => (
                        <li key={qi} className="text-xs sm:text-sm text-slate-300 flex gap-2 leading-snug">
                          <span className="text-purple-400 shrink-0">{qi + 1}.</span>
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----- Marquee Questions ----- */
function MarqueeQuestions() {
  const doubled = [...ALL_QUESTIONS, ...ALL_QUESTIONS];
  return (
    <div className="relative py-8 overflow-hidden border-y border-white/5">
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#0F0F23] to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#0F0F23] to-transparent z-10" />
      <div className="marquee-track flex gap-8 whitespace-nowrap">
        {doubled.map((q, i) => (
          <span key={i} className="text-slate-500 text-sm px-4 py-2 glass rounded-full shrink-0 inline-block">
            {q}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ----- Features Grid ----- */
function FeaturesGrid() {
  const ref = useScrollReveal();
  return (
    <section id="features" className="relative py-20 sm:py-28 overflow-hidden">
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-pink-500/5 rounded-full blur-[200px]" />
      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16 reveal">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Возможности <span className="gradient-text">бота</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Всё продумано для комфортного прохождения
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {FEATURES.map((f, i) => (
            <div key={i} className={`reveal reveal-delay-${(i % 5) + 1} glass card-lift p-5 sm:p-6`}>
              <div className="text-3xl mb-3">{f.emoji}</div>
              <h3 className="font-bold text-base sm:text-lg mb-1">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----- Result Preview ----- */
function ResultPreview() {
  const ref = useScrollReveal();
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[200px]" />
      <div ref={ref} className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16 reveal">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Что ты <span className="gradient-text">получишь</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Подробный психологический портрет на email
          </p>
        </div>
        <div className="reveal glass p-6 sm:p-8 md:p-10 max-w-2xl mx-auto relative">
          {/* Glow border */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/20 via-transparent to-cyan-500/20 pointer-events-none" />
          <div className="relative">
            {/* Mock header */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-lg">🧠</div>
              <div>
                <p className="font-bold text-sm">Психологический портрет</p>
                <p className="text-xs text-slate-500">от UznaikaBot • AI-анализ</p>
              </div>
            </div>
            {/* Result items */}
            <div className="space-y-3">
              {RESULT_ITEMS.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                  <span className="text-xl shrink-0">{item.emoji}</span>
                  <div>
                    <p className="font-medium text-sm sm:text-base">{item.text}</p>
                    <div className="mt-1.5 h-2 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-500"
                        style={{ width: `${60 + Math.random() * 35}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----- Random Question Card ----- */
function RandomQuestionCard() {
  const [question, setQuestion] = useState(ALL_QUESTIONS[0]);
  const [isAnimating, setIsAnimating] = useState(false);

  const randomize = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => {
      const rand = ALL_QUESTIONS[Math.floor(Math.random() * ALL_QUESTIONS.length)];
      setQuestion(rand);
      setIsAnimating(false);
    }, 300);
  }, []);

  return (
    <div className="glass p-6 sm:p-8 text-center max-w-md mx-auto">
      <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider">Пример вопроса</p>
      <p
        className={`text-lg sm:text-xl font-semibold mb-6 min-h-[3em] flex items-center justify-center transition-all duration-300 ${
          isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
        }`}
      >
        «{question}»
      </p>
      <button
        onClick={randomize}
        className="px-6 py-2.5 rounded-full glass text-sm font-medium hover:bg-white/10 transition-all active:scale-95 min-h-[44px]"
      >
        🎲 Другой вопрос
      </button>
    </div>
  );
}

/* ----- Commands Section ----- */
function CommandsSection() {
  const ref = useScrollReveal();
  const [openTab, setOpenTab] = useState(0);

  return (
    <section id="commands" className="relative py-20 sm:py-28 overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[200px]" />
      <div ref={ref} className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16 reveal">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Команды <span className="gradient-text">бота</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Полный контроль через удобные команды
          </p>
        </div>

        {/* Random question card */}
        <div className="mb-12 reveal">
          <RandomQuestionCard />
        </div>

        {/* Tabs */}
        <div className="reveal">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
            {COMMANDS.map((cat, i) => (
              <button
                key={i}
                onClick={() => setOpenTab(i)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 min-h-[44px] ${
                  openTab === i
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20'
                    : 'glass text-slate-400 hover:text-white'
                }`}
              >
                {cat.category}
              </button>
            ))}
          </div>
          <div className="glass p-4 sm:p-6 md:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {COMMANDS[openTab].items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                  <code className="font-mono text-cyan-400 text-sm bg-cyan-400/10 px-2.5 py-1 rounded-lg whitespace-nowrap">
                    {item.cmd}
                  </code>
                  <span className="text-sm text-slate-400">— {item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----- FAQ Section ----- */
function FAQSection() {
  const ref = useScrollReveal();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="relative py-20 sm:py-28 overflow-hidden">
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-pink-500/5 rounded-full blur-[200px]" />
      <div ref={ref} className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16 reveal">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Частые <span className="gradient-text">вопросы</span>
          </h2>
        </div>
        <div className="space-y-3 reveal">
          {FAQ_DATA.map((faq, i) => (
            <div key={i} className="glass overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-medium text-sm sm:text-base hover:bg-white/5 transition-colors min-h-[52px]"
              >
                <span>{faq.q}</span>
                <span
                  className={`text-xl ml-4 shrink-0 transition-transform duration-300 ${
                    openIndex === i ? 'rotate-45' : ''
                  }`}
                >
                  +
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === i ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="px-4 sm:px-5 pb-4 sm:pb-5 text-sm text-slate-400 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----- Testimonials ----- */
function Testimonials() {
  const ref = useScrollReveal();
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16 reveal">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Что говорят <span className="gradient-text">пользователи</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className={`reveal reveal-delay-${i + 1} glass card-lift p-5 sm:p-6`}>
              <div className="text-3xl mb-3">{t.avatar}</div>
              <p className="text-sm text-slate-300 leading-relaxed mb-4 italic">«{t.text}»</p>
              <p className="text-sm font-semibold text-purple-400">{t.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----- CTA Section ----- */
function CTASection() {
  const ref = useScrollReveal();
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent" />
      <div ref={ref} className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="reveal glass p-8 sm:p-12 md:p-16 glow relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-[80px]" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-500/20 rounded-full blur-[80px]" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Готов <span className="gradient-text">узнать себя</span>?
            </h2>
            <p className="text-lg text-slate-400 mb-8 max-w-lg mx-auto">
              30 вопросов, которые раскроют тебя с новой стороны
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://t.me/lessonWOWbot"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-lg font-bold hover:from-purple-500 hover:to-indigo-500 transition-all duration-300 pulse-cta hover:scale-105 text-center min-h-[52px]"
              >
                🚀 Начать тест в Telegram
              </a>
              <a
                href="https://t.me/uznaikadev"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 rounded-full glass text-base font-semibold hover:bg-white/10 transition-all duration-300 hover:scale-105 text-center min-h-[52px]"
              >
                📢 Следить за обновлениями
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----- Footer ----- */
function Footer() {
  return (
    <footer className="relative border-t border-white/5 py-10 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧠</span>
            <span className="text-lg font-bold gradient-text">UznaikaBot</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm">
            <a
              href="https://t.me/lessonWOWbot"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-cyan-400 transition-colors"
            >
              Бот
            </a>
            <a
              href="https://t.me/uznaikadev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-cyan-400 transition-colors"
            >
              Канал
            </a>
            <span className="text-slate-600">Приватность</span>
          </div>

          {/* Copyright */}
          <p className="text-sm text-slate-500">
            Сделано с ❤️ командой <span className="text-purple-400">UznaikaDevs</span> • 2025
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ----- Animated Test Progress Bar ----- */
function TestProgressBar() {
  const ref = useScrollReveal();
  const [progress, setProgress] = useState(0);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          let p = 0;
          const timer = setInterval(() => {
            p += 1;
            if (p > 30) { clearInterval(timer); return; }
            setProgress(p);
          }, 60);
        }
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="py-10 sm:py-16 overflow-hidden">
      <div ref={ref} className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="reveal glass p-6 sm:p-8" ref={barRef}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-300">Прогресс теста</span>
            <span className="text-sm font-mono text-cyan-400">{progress}/30</span>
          </div>
          <div className="h-3 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-400 transition-all duration-100"
              style={{ width: `${(progress / 30) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-slate-500">🎭 Метафоры</span>
            <span className="text-xs text-slate-500">⚖️ Ценности</span>
            <span className="text-xs text-slate-500">🔍 Ситуации</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== MAIN APP ===== */
export default function App() {
  return (
    <div className="min-h-screen bg-[#0F0F23] text-white relative">
      <Stars />
      <ScrollProgress />
      <Navbar />

      <main>
        <HeroSection />
        <HowItWorks />
        <TestProgressBar />
        <QuestionBlocks />
        <MarqueeQuestions />
        <FeaturesGrid />
        <ResultPreview />
        <CommandsSection />
        <FAQSection />
        <Testimonials />
        <CTASection />
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
}
