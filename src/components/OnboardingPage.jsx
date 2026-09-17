import GBIcon from './GBIcon';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, Check, Search, Image, Mic, MessageSquare, Lightbulb, Gamepad2 } from './GBIcon';
import GameBuddyMark from './GameBuddyMark';
import { initialBuddies, loadBuddyState } from './BuddyPage';
import './OnboardingPage.css';

export const ONBOARDING_KEY = 'gamebuddy-onboarding-v1';

// Condensed from Android GuideScreen and BootstrapScreen. Native permission
// setup stays in the contextual GameAssist flow rather than being simulated here.
export default function OnboardingPage({ chinese, theme, onComplete }) {
  const t = (en, zh) => chinese ? zh : en;
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [style, setStyle] = useState(() => loadBuddyState().active);
  const [example, setExample] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const reducedMotion = useReducedMotion();
  const heading = useRef(null);
  const body = useRef(null);
  useEffect(() => { body.current?.scrollTo(0, 0); heading.current?.focus({ preventScroll: true }); }, [step]);
  const examples = [
    [t('Find my next strategy game', '推荐一款策略游戏'), t('Try Teamfight Tactics: draft champions, build a team, and outlast your opponents.', '试试《云顶之弈》：招募英雄、搭配阵容，战胜你的对手。')],
    [t('Help me build a better team', '帮我搭配更强的阵容'), t('Share your lineup or a screenshot. We can work out what your team is missing.', '发来你的阵容或截图，一起看看队伍还缺什么。')],
  ];
  const titles = [t('Your next move\nstarts with a question.', '下一步怎么玩，\n问问就知道。'), t('A little help.\nRight when you need it.', '需要时，\n搭子就在身边。'), t('Find your kind\nof Buddy.', '选一个\n合拍的搭子。'), t('You’re ready\nfor your next move.', '准备好了，\n一起开始吧。')];
  const descriptions = [t('Discover games and get guides with a question, screenshot, or your voice.', '用问题、截图或语音，发现好游戏，找到实用攻略。'), t('GameAssist brings tips and conversation into your game. Tap the floating button to explore.', 'GameAssist 把提示和对话带进游戏。点一下悬浮球，试试展开面板。'), t('Choose how your Buddy talks to you. You can switch anytime in Buddy.', '选择你喜欢的交流风格，之后随时可以在 Buddy 中切换。'), t('Start with a search. Enable GameAssist whenever you want help while playing.', '从一次搜索开始。想边玩边获得帮助时，再开启 GameAssist。')];
  function move(next) { setDirection(next > step ? 1 : -1); setStep(next); }
  function finish(saveStyle) {
    try {
      if (saveStyle) { const state = loadBuddyState(); state.active = style; localStorage.setItem('gamebuddy-buddy-demo-v1', JSON.stringify(state)); }
      localStorage.setItem(ONBOARDING_KEY, 'done');
    } catch {}
    onComplete();
  }
  const selected = initialBuddies.find(b => b.id === style);
  return <section className="ob-page" aria-label={t('Welcome to GameBuddy', '欢迎使用 GameBuddy')}>
    <header className="ob-nav">
      <button className="ob-back" disabled={step === 0} aria-label={t('Previous step', '上一步')} onClick={() => move(step - 1)}><ChevronLeft size={20}/></button>
      <img src={`${import.meta.env.BASE_URL}assets/gb-logo-${theme}.svg`} alt="TapTap GameBuddy"/>
      <button className="ob-skip" onClick={() => finish(false)}>{t('Skip', '跳过')}</button>
    </header>
    <div className="ob-body" ref={body}>
      <p className="ob-eyebrow">{t('A QUICK INTRODUCTION', '快速认识你的游戏搭子')}</p>
      <h1 ref={heading} tabIndex={-1}>{titles[step]}</h1>
      <p className="ob-description">{descriptions[step]}</p>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={step} className="ob-demo" initial={{ opacity: 0, x: reducedMotion ? 0 : direction * 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: reducedMotion ? 0 : direction * -12 }} transition={{ duration: reducedMotion ? 0 : .18 }}>
          {step === 0 && <>
            <div className="ob-search-preview"><div className="ob-query"><Search size={18}/><span>{examples[example][0]}</span></div><div className="ob-answer"><GameBuddyMark/><p>{examples[example][1]}</p></div><div className="ob-input-tools"><Image size={18}/><Mic size={18}/><span>{t('Ask it your way', '用你习惯的方式提问')}</span></div></div>
            <div className="ob-examples" aria-label={t('Example searches', '搜索示例')}>{examples.map(([label], i) => <button key={i} aria-pressed={example === i} onClick={() => setExample(i)}>{label}</button>)}</div>
          </>}
          {step === 1 && <>
            <div className="ob-assist-scene"><span className="ob-scene-label">{t('Interactive preview', '互动预览')}</span><Gamepad2 className="ob-game-scene" aria-hidden="true"/>
              {expanded && <div className="ob-assist-panel"><p><Lightbulb size={18}/>{t('Tips for your next move', '下一步的实用提示')}</p><p><MessageSquare size={18}/>{t('Your conversations', '你的对话记录')}</p><p><Mic size={18}/>{t('Start or end voice help', '开始或结束语音辅助')}</p></div>}
              <button className="ob-floating" aria-label={t('Toggle GameAssist preview', '展开或收起游戏助手预览')} aria-expanded={expanded} onClick={() => setExpanded(v => !v)}><GBIcon name="buddy-after" className="ga-floating-art"/></button>
            </div>
            <p className="ob-note">{t('You decide when to share your screen, game audio, and microphone. No permissions are requested here.', '屏幕、游戏音频和麦克风由你决定何时共享，这一步不会申请权限。')}</p>
          </>}
          {step === 2 && <div className="hs-assist-choices ob-choices" role="group" aria-label={t('Buddy style', '搭子风格')}>{initialBuddies.map(b => <button key={b.id} aria-pressed={style === b.id} onClick={() => setStyle(b.id)}><GBIcon className="hs-choice-indicator" name={style === b.id ? "select-after" : "select-before"}/><span><strong>{b.name[chinese ? 1 : 0]}</strong><small>{b.description[chinese ? 1 : 0]}</small><em>{b.id === 'gaming-wingman' ? t('“Tough round. Let’s try a different angle.”', '「这局有点难，咱们换个思路试试。」') : t('“Save your resources. Upgrade next round.”', '「保留资源，下一回合再升级。」')}</em></span></button>)}</div>}
          {step === 3 && <div className="ob-ready"><div className="ob-ready-mark"><GameBuddyMark/></div><h2>{t('Meet your Buddy', '认识你的搭子')}</h2><strong>{selected?.name[chinese ? 1 : 0] || t('Your Buddy', '你的搭子')}</strong><p>{selected?.description[chinese ? 1 : 0]}</p><div><Check size={18}/>{t('Search in your own words', '用自己的话搜索')}</div><div><Check size={18}/>{t('GameAssist when you choose', '按需开启 GameAssist')}</div><div><Check size={18}/>{t('A Buddy that fits your style', '选择适合你的搭子风格')}</div></div>}
        </motion.div>
      </AnimatePresence>
    </div>
    <footer className="ob-footer"><div className="ob-progress" aria-label={t(`Step ${step + 1} of 4`, `第 ${step + 1} 步，共 4 步`)}>{titles.map((_, i) => <span key={i} className={i === step ? 'active' : ''}/>)}</div><button className="ac-primary ob-next" onClick={() => step === 3 ? finish(true) : move(step + 1)}>{step === 3 ? t('Start exploring', '开始探索') : t('Continue', '继续')}</button><p>{t('You can revisit this guide in Profile.', '之后可在个人页面重新查看引导。')}</p></footer>
  </section>;
}
