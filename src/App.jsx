import SplashScreen from './components/SplashScreen';
import SignInPage from './components/SignInPage';
import SquadUnavailable from './components/SquadUnavailable';
import { useEffect, useState } from "react";
import { AnimatePresence, motion, MotionConfig, useReducedMotion } from "framer-motion";
import { Sun, Moon, PanelLeft } from "lucide-react";
import HomeSearch from "./components/HomeSearch";
import BuddyPage from "./components/BuddyPage";
import AccountPage from "./components/AccountPage";
const copyByLang = {
  en: { controls: { language: "Language", appearance: "Switch light / dark appearance" }, title: ["Find your next move."], body: "Get more out of your games. Search with a screenshot, video or ask about any game.", home: "Home", buddy: "Buddy", teamup: "Squad", preview: "Home screen", pending: "This screen is next.", back: "Back to Home" },
  zh: { controls: { language: "语言", appearance: "切换浅色 / 深色模式" }, title: ["找游戏，找攻略，找队友"], body: "让游戏体验更上一层。用截图或视频搜索，也可以直接提问，了解任何游戏。", home: "首页", buddy: "Buddy", teamup: "组队", preview: "首页预览", pending: "这个页面即将加入。", back: "返回首页" }
};
function App() {
  const [focusDemo, setFocusDemo] = useState(false);
  const reduceLayoutMotion = useReducedMotion();
  const focusTransition = { duration: reduceLayoutMotion ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] };
  const [homeLayout, setHomeLayout] = useState("v1");
  const [signedIn, setSignedIn] = useState(false);
  const readPreference = (key, fallback) => { try { return localStorage.getItem(key) || fallback; } catch { return fallback; } };
  const [tab, setTab] = useState("home");
  const [searchDetailOpen, setSearchDetailOpen] = useState(false);
  const [appearance, setTheme] = useState(() => readPreference('gb-appearance', 'dark'));
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
        <div className="variant-brand" aria-label="GameBuddy"><img src={`${import.meta.env.BASE_URL}assets/brand.svg`} alt=""/><span>GameBUDDY</span></div>
        <h2>{copy.title.map(line => <span className="title-line" key={line}>{line}</span>)}</h2>
        <p>{copy.body}</p>
        {signedIn && tab === "home" && !searchDetailOpen && <div className="home-layout-picker" role="group" aria-label={lang === 'zh' ? '首页布局' : 'Home layout'}>
          {['v1', 'v2'].map(version => <button key={version} type="button" aria-pressed={homeLayout === version} onClick={() => setHomeLayout(version)}>{version.toUpperCase()}</button>)}
        </div>}
      </motion.div>}</AnimatePresence>
      <motion.div layout="position" transition={{ layout: focusTransition }} className="variant-device-position"><div className="variant-devices"><PhoneMockup searchDetailOpen={searchDetailOpen} setSearchDetailOpen={setSearchDetailOpen} tab={tab} setTab={setTab} signedIn={signedIn} setSignedIn={setSignedIn} homeLayout={homeLayout} copy={copy} theme={theme} appearance={appearance} setAppearance={setTheme} language={lang} setLanguage={setLang} /></div></motion.div>
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
        <PanelLeft size={19} strokeWidth={1.5} />
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
        {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
      </button>
    </motion.nav>
  );
}


const asset = name => `${import.meta.env.BASE_URL}assets/${name}.svg`;
function PhoneMockup({ searchDetailOpen, setSearchDetailOpen, tab, setTab, signedIn, setSignedIn, homeLayout, copy, theme, appearance, setAppearance, language, setLanguage }) {
  const reducedMotion = useReducedMotion();
  const entryTransition = { duration: reducedMotion ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] };
  const homeTransition = { ...entryTransition, duration: reducedMotion ? 0 : 0.35 };
  const [accountOpen, setAccountOpen] = useState(false);
  const [splashVisible, setSplashVisible] = useState(true);
  useEffect(() => {
    const timer = window.setTimeout(() => setSplashVisible(false), 1000);
    return () => window.clearTimeout(timer);
  }, []);
  const profileTransition = { duration: reducedMotion ? 0 : 0.5, ease: [0.4, 0, 0.2, 1] };
  return <div className="phone phone-normal"><div className="phone-metal"><div className="phone-screen gb-screen">
    <div className="gb-home" data-node-id="169:378" aria-label={copy.home}>
      {signedIn && <motion.div className={`gb-entry-layer${searchDetailOpen ? " gb-showing-search-detail" : ""}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={homeTransition}><div className="gb-status" aria-label="5:13 PM">
        <img className="gb-time gb-status-asset" src={asset("time")} width="67.882" height="22.627" alt="" />
        <div className="gb-status-right">{["wifi", "signal", "battery"].map(name => <img className="gb-status-asset" key={name} src={asset(name)} width="22.627" height="22.627" alt="" />)}</div>
      </div>
      <motion.div className={`gb-content${searchDetailOpen ? " gb-search-detail-content" : ""}`} inert={accountOpen} animate={{ x: accountOpen && !reducedMotion ? "-20%" : 0 }} transition={profileTransition}>{tab === "home" && <HomeSearch onSearchDetailChange={setSearchDetailOpen} layout={homeLayout} chinese={copy.home === "首页"} theme={theme} onOpenAccount={() => setAccountOpen(true)} />}{tab === "buddy" && <BuddyPage chinese={copy.home === "首页"} theme={theme} />}{tab === "teamup" && <SquadUnavailable chinese={copy.home === "首页"} />}</motion.div>
      <AnimatePresence initial={false}>{accountOpen && <motion.div key="profile" className="gb-content gb-account-content" initial={{ x: reducedMotion ? 0 : "100%", opacity: reducedMotion ? 1 : 0.8 }} animate={{ x: 0, opacity: 1 }} exit={{ x: reducedMotion ? 0 : "100%", opacity: reducedMotion ? 1 : 0.8 }} transition={profileTransition}><AccountPage appearance={appearance} setAppearance={setAppearance} language={language} setLanguage={setLanguage} onSignOut={() => { setAccountOpen(false); setSignedIn(false); setTab("home"); }} chinese={copy.home === "首页"} onBack={() => setAccountOpen(false)} /></motion.div>}</AnimatePresence>
      <nav inert={accountOpen || searchDetailOpen} aria-hidden={searchDetailOpen || undefined} className={`gb-tabs${searchDetailOpen ? " gb-tabs-hidden" : ""}${homeLayout === "v2" && tab === "home" ? " gb-tabs-borderless" : ""}`} aria-label={copy.preview}>{["home", "buddy", "teamup"].map(name => <button key={name} type="button" aria-current={tab === name ? "page" : undefined} className={tab === name ? "selected" : ""} onClick={() => setTab(name)}>
        <span className="gb-tab-icon">{name === "home" ? <img className="gb-home-icon" src={asset("home")} width="28" height="28" alt="" /> : name === "teamup" ? <span className="gb-buddy-tab-glyph" style={{maskImage:`url(${asset("squad")})`,WebkitMaskImage:`url(${asset("squad")})`}}/> : <span className="gb-buddy-tab-glyph" style={{maskImage:`url(${asset(name)})`,WebkitMaskImage:`url(${asset(name)})`}}/>}</span><span>{copy[name]}</span>
      </button>)}</nav></motion.div>}
      <AnimatePresence initial={false}>
        {splashVisible && <motion.div key="splash" className="gb-splash-layer" exit={{ opacity: 0 }} transition={entryTransition}><SplashScreen /></motion.div>}
      </AnimatePresence>
      <AnimatePresence initial={false}>
        {!signedIn && !splashVisible && <motion.div key="signin" className="gb-signin-layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={signedIn ? homeTransition : entryTransition}>
          <SignInPage chinese={copy.home === "首页"} onContinue={() => {setTab("home");setSignedIn(true);}} />
        </motion.div>}
      </AnimatePresence>
    </div>
  </div></div></div>;
}
export default App;
