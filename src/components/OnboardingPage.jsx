import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import GBIcon, { ChevronLeft } from './GBIcon';
import { initialBuddies, loadBuddyState } from './BuddyPage';
import './OnboardingPage.css';
import OnboardingAssistPreview from './OnboardingAssistPreview';

export const ONBOARDING_KEY = 'gamebuddy-onboarding-v1';
const scenes = ['search', 'assist', 'buddy'];

export default function OnboardingPage({ chinese, onComplete }) {
  const t = (en, zh) => chinese ? zh : en;
  const [step, setStep] = useState(0);
  const [style, setStyle] = useState(() => {
    const active = loadBuddyState().active;
    return initialBuddies.some(b => b.id === active) ? active : initialBuddies[0].id;
  });
  const reducedMotion = useReducedMotion();
  const heading = useRef(null);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, [step]);
  // Preload all three illustrations so moving forward never flashes empty art.
  useEffect(() => { scenes.forEach(scene => { const image = new window.Image(); image.src = `${import.meta.env.BASE_URL}assets/onboarding-${scene}.png`; }); }, []);
  function finish(saveStyle) {
    try {
      if (saveStyle && style) {
        const state = loadBuddyState();
        state.active = style;
        localStorage.setItem('gamebuddy-buddy-demo-v1', JSON.stringify(state));
      }
      localStorage.setItem(ONBOARDING_KEY, 'done');
    } catch {}
    onComplete();
  }
  const titles = [t('A search that speaks gamer', '更懂玩家的搜索'), t('Less guessing, more clutch moments', '少一些犹豫，\n多一些逆风翻盘'), t('Your next adventure deserves a Buddy who gets you', '下一场冒险\n和懂你的搭子一起出发')];
  return <section lang={chinese ? 'zh-CN' : 'en'} className={`ob-page ob-step-${scenes[step]}`} aria-label={t('Welcome to GameBuddy', '欢迎使用 GameBuddy')}>
    <div className="ob-gradient" aria-hidden="true"/>
    <AnimatePresence initial={false}>
      <motion.div key={step} className={`ob-art ob-art-${scenes[step]}`} aria-hidden="true" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0 : .25 }}>
        <img src={`${import.meta.env.BASE_URL}assets/onboarding-${scenes[step]}.png`} alt=""/>
      </motion.div>
    </AnimatePresence>
    <header className="ob-nav">
      <button className="ob-back" disabled={step === 0} aria-label={t('Previous step', '上一步')} onClick={() => setStep(step - 1)}><ChevronLeft size={20}/></button>
      <button className="ob-skip" onClick={() => finish(false)}>{t('Skip', '跳过')}</button>
    </header>
    <motion.div key={step} className="ob-body" initial={{ opacity: 0, y: reducedMotion ? 0 : 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reducedMotion ? 0 : .3 }}>
      <h1 ref={heading} tabIndex={-1}>{titles[step]}</h1>
      {step === 0 ? <div className="ob-search-example" aria-label={t('Example AI search conversation', 'AI 搜索示例对话')}>
        <motion.p className="ob-example-question" initial={{ opacity: 0, scale: reducedMotion ? 1 : .94, y: reducedMotion ? 0 : 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: reducedMotion ? 0 : .18, duration: reducedMotion ? 0 : .32, ease: [.22, 1.2, .36, 1] }}>{t("I\u2019m playing TFT and losing rounds. Should I spend my gold or save it?", "金铲铲的战士装为什么很多人推荐饮血剑泰坦血手？")}</motion.p>
        <motion.div className="ob-example-answer" initial={{ opacity: 0, scale: reducedMotion ? 1 : .94, y: reducedMotion ? 0 : 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: reducedMotion ? 0 : .5, duration: reducedMotion ? 0 : .36, ease: [.22, 1.2, .36, 1] }}>
          <p>{t("Don\u2019t roll just because you lost a round. If your health is low and you\u2019re losing badly, spend to stabilize your board. If losses are small, saving can give you a stronger upgrade later.", "战士通常需要贴脸输出，生存压力远高于后排。饮血提供续航和护盾，血手防止被瞬间击杀，泰坦兼顾持续增伤与坦度，三件套容错更高、有效输出更稳定；无尽正义虽然理论伤害更高，但更依赖良好的输出环境。")}</p>
          <p className="ob-example-followup">{t("What stage are you on, and how much health and gold do you have? Send your board and I\u2019ll help you weigh the next move.", "不过经常还需要在游戏里灵活应变，有疑问也可以发给我具体场景帮你分析一下。")}</p>
        </motion.div>
      </div> : null}
      {step === 2 && <div className="ob-choices" role="group" aria-label={t('Choose your Buddy', '选择你的搭子')}>
        {initialBuddies.map(b => <button key={b.id} aria-pressed={style === b.id} onClick={() => setStyle(b.id)}>
          <GBIcon name={style === b.id ? 'select-after' : 'select-before'} className="ob-choice-indicator"/>
          <span><strong>{b.name[chinese ? 1 : 0]}</strong><small>{b.description[chinese ? 1 : 0]}</small></span>
        </button>)}
      </div>}
      {step === 2 && <p className="ob-buddy-caption">{t('You can always pick another Buddy later.', '之后也能在 Buddy 页面选择其他搭子。')}</p>}
    </motion.div>
    {step === 1 && <OnboardingAssistPreview chinese={chinese}/>}
    <footer className="ob-footer">
      <div className="ob-progress" aria-label={t(`Step ${step + 1} of 3`, `第 ${step + 1} 步，共 3 步`)}>{scenes.map((scene, i) => <span key={scene} className={i === step ? 'active' : ''}/>)}</div>
      <button className="ob-next" disabled={step === 2 && !style} onClick={() => step === 2 ? finish(true) : setStep(step + 1)}>{step === 2 ? t('Get started', '开始体验') : t('Next', '下一步')}</button>
    </footer>
  </section>;
}
