import SplashScreen from './components/SplashScreen';
import OnboardingPage from './components/OnboardingPage';
import SignInPage from './components/SignInPage';
import { useEffect, useState } from "react";
import { AnimatePresence, motion, MotionConfig, useReducedMotion } from "framer-motion";
import GBIcon from "./components/GBIcon";
import HomeSearch from "./components/HomeSearch";
import BuddyPage from "./components/BuddyPage";
import AccountPage from "./components/AccountPage";
const copyByLang = {
  en: { controls: { language: "Language", appearance: "Switch light / dark appearance" }, title: ["Find your next move."], body: "Get more out of your games. Search with a screenshot, video or ask about any game.", home: "Home", buddy: "Buddy", profile: "Me", preview: "Home screen", pending: "This screen is next.", back: "Back to Home" },
  zh: { controls: { language: "语言", appearance: "切换浅色 / 深色模式" }, title: ["找游戏，找攻略，找队友"], body: "让游戏体验更上一层。用截图或视频搜索，也可以直接提问，了解任何游戏。", home: "首页", buddy: "Buddy", profile: "我的", preview: "首页预览", pending: "这个页面即将加入。", back: "返回首页" }
};
function App() {
  const [focusDemo, setFocusDemo] = useState(true);
  const reduceLayoutMotion = useReducedMotion();
  const focusTransition = { duration: reduceLayoutMotion ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] };
  const [homeLayout, setHomeLayout] = useState("v1");
  const [signedIn, setSignedIn] = useState(false);
  const readPreference = (key, fallback) => { try { return localStorage.getItem(key) || fallback; } catch { return fallback; } };
  const [tab, setTab] = useState("home");
  const [searchDetailOpen, setSearchDetailOpen] = useState(false);
  const [appearance, setTheme] = useState(() => readPreference('gb-appearance', 'light'));
  const [systemDark, setSystemDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
  const [lang, setLang] = useState(() => readPreference('gb-language', 'en'));
  const theme = appearance === 'system' ? (systemDark ? 'dark' : 'light') : appearance;
  const copy = copyByLang[lang] || copyByLang.en;
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const update = e => setSystemDark(e.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => { try { localStorage.setItem('gb-appearance', appearance); localStorage.setItem('gb-language', lang); } catch {} }, [appearance, lang]);
  useEffect(() => { document.documentElement.lang = lang === "zh" ? "zh-CN" : "en"; }, [lang]);
  return <MotionConfig reducedMotion="user"><div className={`app-shell theme-${theme}`}>
    <AmbientField />
    <Nav focusDemo={focusDemo} setFocusDemo={setFocusDemo} theme={theme} setTheme={setTheme} lang={lang} setLang={setLang} copy={copy} />
    <main><section className={`variant-section${focusDemo ? " variant-focused" : ""}`} id="states">
      <AnimatePresence initial={false} mode="popLayout">{!focusDemo && <motion.div key="tagline" className="variant-copy" id="demo-tagline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduceLayoutMotion ? 0 : 0.25 }}>
        <div className="variant-brand" aria-label="GameBuddy"><img className="gb-logo-lockup" src={`${import.meta.env.BASE_URL}assets/gb-logo-${theme}.svg`} alt="TapTap GameBuddy"/></div>
        <h2>{copy.title.map(line => <span className="title-line" key={line}>{line}</span>)}</h2>
        <p>{copy.body}</p>
        {signedIn && tab === "home" && !searchDetailOpen && <div className="home-layout-picker" role="group" aria-label={lang === 'zh' ? '首页布局' : 'Home layout'}>
          {['v1', 'v2'].map(version => <button key={version} type="button" aria-pressed={homeLayout === version} onClick={() => setHomeLayout(version)}>{version.toUpperCase()}</button>)}
        </div>}
      </motion.div>}</AnimatePresence>
      <motion.div layout="position" transition={{ layout: focusTransition }} className="variant-device-position"><div className="variant-devices"><PhoneMockup searchDetailOpen={searchDetailOpen} setSearchDetailOpen={setSearchDetailOpen} tab={tab} setTab={setTab} signedIn={signedIn} setSignedIn={setSignedIn} homeLayout={homeLayout === "v1" ? "v2" : "v1"} copy={copy} theme={theme} appearance={appearance} setAppearance={setTheme} language={lang} setLanguage={setLang} /></div></motion.div>
    </section></main>
  </div></MotionConfig>;
}
function AmbientField() {
  return (
    <div className="ambient-field" aria-hidden="true">
      <motion.div
        className="ambient-beam beam-b"
        animate={{ x: [0, 24, 0], opacity: [0.2, 0.36, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="grain" />
    </div>
  );
}

function Nav({ theme, setTheme, lang, setLang, copy, focusDemo, setFocusDemo }) {
  return (
    <motion.nav
      className="nav"
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <button className="icon-button demo-focus-toggle" type="button" aria-controls="demo-tagline" aria-expanded={!focusDemo} aria-label={focusDemo ? (lang === 'zh' ? '显示介绍' : 'Show tagline') : (lang === 'zh' ? '专注演示' : 'Focus on demo')} title={focusDemo ? (lang === 'zh' ? '显示介绍' : 'Show tagline') : (lang === 'zh' ? '专注演示' : 'Focus on demo')} onClick={() => setFocusDemo(value => !value)}>
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/></svg>
      </button>
      <div className="language-switch" role="tablist" aria-label={copy.controls.language}>
        {[
          ["en", "En"],
          ["zh", "Ch"],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={lang === value ? "active" : ""}
            aria-pressed={lang === value}
            onClick={() => setLang(value)}
          >
            {lang === value && <motion.span layoutId="language-pill" className="language-pill" />}
            <span>{label}</span>
          </button>
        ))}
      </div>
      <button
        className="icon-button"
        type="button"
        aria-label={copy.controls.appearance}
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {theme === "dark" ? <><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></> : <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6.25 6.25 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/>}
        </svg>
      </button>
    </motion.nav>
  );
}


const asset = name => `${import.meta.env.BASE_URL}assets/${name}.svg`;
function PhoneMockup({ searchDetailOpen, setSearchDetailOpen, tab, setTab, signedIn, setSignedIn, homeLayout, copy, theme, appearance, setAppearance, language, setLanguage }) {
  const reducedMotion = useReducedMotion();
  const entryTransition = { duration: reducedMotion ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] };
  const homeTransition = { ...entryTransition, duration: reducedMotion ? 0 : 0.35 };
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [splashVisible, setSplashVisible] = useState(true);
  useEffect(() => {
    const timer = window.setTimeout(() => setSplashVisible(false), 2000);
    return () => window.clearTimeout(timer);
  }, []);
  return <div className="phone phone-normal"><div className="phone-metal"><div className="phone-screen gb-screen">
    <div className="gb-home" data-node-id="169:378" aria-label={copy.home}>
      {signedIn && !onboardingOpen && <motion.div className={`gb-entry-layer${searchDetailOpen ? " gb-showing-search-detail" : ""}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={homeTransition}><div className="gb-status" aria-label="5:13 PM">
        <img className="gb-time gb-status-asset" src={asset("time")} width="67.882" height="22.627" alt="" />
        <div className="gb-status-right">{["wifi", "signal", "battery"].map(name => <img className="gb-status-asset" key={name} src={asset(name)} width="22.627" height="22.627" alt="" />)}</div>
      </div>
      <div className={`gb-content${searchDetailOpen ? " gb-search-detail-content" : ""}`}>
        {tab === "home" && <HomeSearch onSearchDetailChange={setSearchDetailOpen} layout={homeLayout} chinese={copy.home === "首页"} theme={theme} onOpenAccount={() => setTab("profile")} />}
        {tab === "buddy" && <BuddyPage chinese={copy.home === "首页"} theme={theme} />}
        {tab === "profile" && <AccountPage onShowGuide={() => setOnboardingOpen(true)} appearance={appearance} setAppearance={setAppearance} language={language} setLanguage={setLanguage} onSignOut={() => { setSignedIn(false); setTab("home"); }} chinese={copy.home === "首页"} />}
      </div>
      <nav inert={searchDetailOpen} aria-hidden={searchDetailOpen || undefined} className={`gb-tabs${searchDetailOpen ? " gb-tabs-hidden" : ""}${homeLayout === "v2" && tab === "home" ? " gb-tabs-borderless" : ""}`} aria-label={copy.preview}>{["home", "buddy", "profile"].map(name => <button key={name} type="button" aria-current={(tab === name) ? "page" : undefined} className={(tab === name) ? "selected" : ""} onClick={() => setTab(name)}>
        <span className="gb-tab-icon">{name === "profile" ? <img className="gb-tab-avatar" src={`${import.meta.env.BASE_URL}assets/profile-dog.png`} alt=""/> : <GBIcon name={name === "home" ? (tab === name ? "home-after" : "home-before") : (tab === name ? "buddy-after" : "buddy-before")} size={28}/>}</span><span>{copy[name]}</span>
      </button>)}</nav></motion.div>}
      <AnimatePresence initial={false}>
        {splashVisible && <motion.div key="splash" className="gb-splash-layer" exit={{ opacity: 0, scale: reducedMotion ? 1 : 1.025 }} transition={{ duration: reducedMotion ? 0 : 0.85, ease: [0.4, 0, 0.2, 1] }}><SplashScreen /></motion.div>}
      </AnimatePresence>
      <AnimatePresence initial={false}>
        {!signedIn && !onboardingOpen && <motion.div key="signin" className="gb-signin-layer" inert={splashVisible} aria-hidden={splashVisible || undefined} initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={signedIn ? homeTransition : entryTransition}>
          <SignInPage entranceReady={!splashVisible} chinese={copy.home === "首页"} onContinue={() => {setTab("home"); setOnboardingOpen(true);}} />
        </motion.div>}
      </AnimatePresence>
      <AnimatePresence initial={false}>{onboardingOpen && <motion.div key="onboarding" className="gb-signin-layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={homeTransition}><OnboardingPage chinese={copy.home === "首页"} theme={theme} onComplete={() => {setOnboardingOpen(false);setSignedIn(true);setTab("home");}} /></motion.div>}</AnimatePresence>
    </div>
  </div></div></div>;
}
export default App;
