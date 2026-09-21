import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { initialBuddies, loadBuddyState } from './BuddyPage';
import './OnboardingShared.css';
const ONBOARDING_KEY = 'gamebuddy-onboarding-v1';
import './InteractiveOnboarding.css';
import OnboardingAssistPreview from './OnboardingAssistPreview';
import { TypingChatBubble, ChatReplyCards } from './OnboardingChatMotion';
import OnboardingChatLayout from './OnboardingChatLayout';
import FinalBuddyChat from './FinalBuddyChat';
import SearchGameOnboarding from './SearchGameOnboarding';
import HonorOfKingsOnboarding from './HonorOfKingsOnboarding';

const examples = [
  [
    { q: ['Should I roll or save?', '该刷新还是存金币？'], a: ['Ah, the classic roll-or-save dilemma. We can work this out—how’s your board holding up?', '经典的刷新还是存钱！咱们一起看看，你现在扛得住吗？'], follow: [
      [['Low health, losing badly', '血量低，一直大败'], ['Spend enough to stabilize. Look for frontline upgrades and a reliable damage dealer, then reassess before spending the rest.', '先花一部分金币稳住阵容，优先提升前排和主力输出，再决定是否继续刷新。']],
      [['Healthy, small losses', '血量健康，只是小败'], ['You have room to save. Keep useful pairs and protect your economy while planning your next level or upgrade.', '可以先存钱，留下有用的对子，保持经济，同时规划下一次升级人口或提升阵容。']]
    ] },
    { q: ['How do I protect my carry?', '怎么保护主力输出？'], a: ['Let’s give your carry some breathing room. What’s getting them into trouble?', '得让主力安心输出才行。现在最头疼的是什么？'], follow: [
      [['Enemies get behind me', '敌人绕到后排'], ['Try a protector near your carry instead of putting every tank up front. Scout the next opponent and adjust the side you play on.', '别把所有坦克都放在最前面，留一个单位保护主力。观察下个对手，调整主力所在的一侧。']],
      [['My frontline collapses', '前排倒得太快'], ['Strengthen the frontline before adding more damage. Spread incoming pressure and check whether your tank has usable defensive items.', '先补前排再堆输出。分散承伤压力，检查坦克有没有合适的防御装备。']]
    ] }
  ],
  [
    { q: ['Why Bloodthirster + Titan’s?', '为什么推荐饮血剑和泰坦？'], a: ['Melee carries take hits while dealing damage. Bloodthirster adds sustain and a shield; Titan’s rewards staying in the fight. The right choice still depends on the unit and the current set.', '近战输出需要一边扛伤一边打伤害。饮血剑提供续航与护盾，泰坦适合持续作战。具体选择仍要看英雄和当前赛季。'], follow: [
      [['What about more damage?', '直接堆伤害呢？'], ['Higher damage only helps while your carry is alive. If they already survive comfortably, another offensive item may be worth considering.', '主力活着才有输出。如果已经能稳定存活，可以考虑再补一件输出装。']],
      [['What should I check first?', '先看什么？'], ['Watch one fight: does your carry die early, or survive but fail to finish enemies? That tells you whether to prioritize survival or damage.', '先观察一场战斗：主力是早早倒下，还是活着却打不动？再决定补生存还是伤害。']]
    ] },
    { q: ['Find a game for my break', '休息时玩什么？'], a: ['Let’s narrow it down. What kind of break are you taking?', '先缩小范围。你想怎么放松？'], follow: [
      [['Something relaxed', '轻松一点'], ['Try Dorfromantik if you enjoy quietly building landscapes. There’s no combat; you place tiles and work toward small goals at your own pace.', '喜欢安静拼出风景的话，可以看看《Dorfromantik》。没有战斗，摆放地块，按自己的节奏完成小目标。']],
      [['A little strategy', '动动脑子'], ['Try a round of Super Auto Pets: build a small animal team and experiment with combinations. It’s easy to start, with plenty to figure out.', '可以试试《超级自动宠物》：组建一支动物小队，尝试不同搭配。容易上手，也有不少策略可琢磨。']]
    ] }
  ]
];
export default function InteractiveOnboarding({ chinese, onComplete }) {
  const l = chinese ? 1 : 0;
  const t = (en, zh) => chinese ? zh : en;
  const [step, setStep] = useState(0);
  const [game, setGame] = useState(null);
  const [honorIntroDone, setHonorIntroDone] = useState(false);
  const [searchIntroDone, setSearchIntroDone] = useState(false);
  const [questions, setQuestions] = useState([null, null]);
  const [followups, setFollowups] = useState([null, null]);
  const [buddy, setBuddy] = useState(null);
  const title = useRef(null);
  const latest = useRef(null);
  const replies = useRef(null);
  const reduce = useReducedMotion();
  const welcomeMessage = t('Hey Frankie 👋\nI’m GameBuddy, your go-to gaming companion. What games are you into? I’ve got tips and strategies to help you out!', 'Hey Frankie 👋\n我是 GameBuddy，你的专属游戏搭子。告诉我，你平时都喜欢玩什么游戏？我可以帮你出谋划策！');
  const [typing, setTyping] = useState({ message: '', count: 0 });
  const visibleCount = reduce ? welcomeMessage.length : typing.message === welcomeMessage ? typing.count : 0;
  const welcomeComplete = visibleCount >= welcomeMessage.length;
  const [choicesReadyFor, setChoicesReadyFor] = useState(null);
  useEffect(() => {
    if (!welcomeComplete || game !== null) {
      setChoicesReadyFor(null);
      return;
    }
    const timer = setTimeout(() => setChoicesReadyFor(welcomeMessage), 500);
    return () => clearTimeout(timer);
  }, [welcomeComplete, welcomeMessage, game]);
  useEffect(() => {
    if (game !== null || reduce) return;
    setTyping({ message: welcomeMessage, count: 0 });
    let timer;
    let count = 0;
    const tick = () => {
      count += 1;
      setTyping({ message: welcomeMessage, count });
      if (count < welcomeMessage.length) timer = setTimeout(tick, 2200 / welcomeMessage.length);
    };
    timer = setTimeout(tick, 450);
    return () => clearTimeout(timer);
  }, [welcomeMessage, game, reduce]);

  useEffect(() => { title.current?.focus({ preventScroll: true }); }, [step, game]);
  useEffect(() => {
    latest.current?.scrollIntoView({ behavior: reduce ? 'instant' : 'smooth', block: 'nearest' });
    if (document.activeElement === document.body) replies.current?.querySelector('button')?.focus({ preventScroll: true });
  }, [questions, followups, buddy, reduce]);
  const selected = step < 2 && questions[step] !== null ? examples[step][questions[step]] : null;
  function finish(save) {
    try {
      if (save && buddy) { const state = loadBuddyState(); state.active = buddy; localStorage.setItem('gamebuddy-buddy-demo-v1', JSON.stringify(state)); }
      localStorage.setItem(ONBOARDING_KEY, 'done');
    } catch {}
    onComplete();
  }
  function choose(index) { setQuestions(v => v.map((x,i) => i === step ? index : x)); setFollowups(v => v.map((x,i) => i === step ? null : x)); }
  const gameChoices = [
    ['Honor of Kings', '王者荣耀', '2301'], ['Golden Spatula', '金铲铲之战', '176937'],
    ['Dota Underlords', '刀塔霸业', '168862'], ['Hearthstone', '炉石传说', '213'],
    ['Something else', '其它']
  ];
  const pop = (delay = 0) => ({
    initial: reduce ? false : { opacity: 0, scale: .78, y: 14 },
    animate: { opacity: 1, scale: 1, y: 0 },
    transition: reduce ? { duration: 0 } : { type: 'spring', stiffness: 340, damping: 19, mass: .8, delay, opacity: { duration: .18, delay } }
  });
  if (game === null) return <section className="ob-page iq-welcome" lang={chinese ? 'zh-CN' : 'en'} aria-label={t('Meet GameBuddy', '认识 GameBuddy')}>
    <div className="iq-welcome-scroll">
      <motion.div className="iq-welcome-bird" aria-hidden="true" {...pop(.1)}><img src={`${import.meta.env.BASE_URL}assets/onboarding-chat-bird.png`} alt=""/></motion.div>
      <motion.div className="iq-welcome-message" {...pop(.3)}><p className="iq-typing-message" ref={title} tabIndex={-1} aria-label={welcomeMessage}><span className="iq-typing-reserve" aria-hidden="true">{welcomeMessage}</span><span className="iq-typing-visible" aria-hidden="true">{welcomeMessage.slice(0, visibleCount)}</span></p></motion.div>
      {welcomeComplete && choicesReadyFor === welcomeMessage && <div className="iq-welcome-choices" role="group" aria-label={t('Games you play', '你在玩的游戏')}>
        {gameChoices.map((choice,i) => <motion.button key={choice[0]} {...pop(i * .09)} onClick={() => setGame(i)}>{choice[2] && <img src={`${import.meta.env.BASE_URL}assets/onboarding-game-${choice[2]}.jpg`} alt=""/>}<span>{choice[l]}</span></motion.button>)}
      </div>}
    </div>
  </section>;
  if (game === 0 && !honorIntroDone) return <HonorOfKingsOnboarding chinese={chinese} onContinue={() => { setHonorIntroDone(true); choose(1); }}/>;
  if (game !== 0 && !searchIntroDone) return <SearchGameOnboarding chinese={chinese} gameName={game === 4 ? null : gameChoices[game][l]} onContinue={() => { setSearchIntroDone(true); setStep(2); }}/>;
  if (step === 2) return <FinalBuddyChat chinese={chinese} onComplete={() => finish(false)}/>;
  const scenes = ['assist', 'search', 'buddy'];
  const intros = [
    t(game === 4 ? "Always up for discovering something new! Let me show you how we can figure things out together." : `${gameChoices[game][0]}—got it! Let me show you how we can figure things out together.`, game === 4 ? '探索新游戏，我也很乐意！先看看咱们可以怎么一起想办法。' : `${gameChoices[game][1]}，收到！先看看咱们可以怎么一起想办法。`),
    t("Builds, boss fights, or your next favorite game—I’m here for all those ‘wait, how?’ moments.", '配装、打 Boss，或是找下一款好游戏，那些“这到底怎么玩”的时刻，都可以来找我。'),
    t("One last thing: what kind of teammate do you click with? Pick a vibe and I’ll say hello.", '最后，聊聊你喜欢什么样的搭子？选个合拍的风格，让我和你打个招呼。')
  ];
  const prompt = step === 0
    ? game === 0 ? t("Let’s protect your carry. What’s happening in your match?", '先来保护主力输出。你遇到了什么情况？') : t("GameAssist helps you think through what’s happening while you play. Want to try a Golden Spatula scenario together?", 'GameAssist 会陪你分析游戏里的局势。要不要一起试试金铲铲之战的一个小场景？')
    : t("Let’s try a search. What’s on your mind?", '来试着搜一下吧。你想知道什么？');
  const reply = (text, key) => <TypingChatBubble key={key}>{text}</TypingChatBubble>;
  return <OnboardingChatLayout key={step} chinese={chinese}>
      {reply(step < 2 ? `${intros[step]} ${prompt}` : intros[step], 'intro')}
      <div className={`iq-chat-media iq-media-${scenes[step]}`} aria-label={t('GameBuddy preview','GameBuddy 预览')}>
        <div className={`ob-art ob-art-${scenes[step]}`} aria-hidden="true"><img src={`${import.meta.env.BASE_URL}assets/onboarding-${scenes[step]}.png`} alt=""/></div>
        {step === 0 && <OnboardingAssistPreview chinese={chinese}/>}
      </div>
      {step < 2 ? <>
        {selected && <>
          <div className="iq-chat-bubble iq-chat-user">{selected.q[l]}</div>
          {reply(selected.a[l], `answer-${questions[step]}`)}
          {followups[step] !== null && <>
            <div className="iq-chat-bubble iq-chat-user">{selected.follow[followups[step]][0][l]}</div>
            {reply(selected.follow[followups[step]][1][l], `follow-${questions[step]}-${followups[step]}`)}
            {reply(step === 0 ? t("That’s the idea—we figure out the next move together. Want to see what else you can ask me?", '就是这样，咱们一起想清楚下一步。想看看还能问我些什么吗？') : t("Keep the questions coming. Now, let’s find your kind of Buddy.", '有问题就接着问。现在，来选个合拍的搭子吧。'), 'outro')}
          </>}
        </>}
      </> : <>
        {buddy && <>
          <div className="iq-chat-bubble iq-chat-user">{t('I’m going with ', '我选')}{initialBuddies.find(b => b.id === buddy)?.name[l]}</div>
          {reply(buddy === 'gaming-wingman' ? t("Hey, we’re a team now! Big wins, messy runs—I’m here for all of it. What are we playing first?", '好耶，以后咱们就是队友了！顺风一起开心，逆风一起想办法。第一局玩什么？') : t("Good to meet you. Bring me the tricky fights and tough calls—we’ll find a plan together. Ready when you are.", '很高兴和你组队。难打的对局、纠结的选择，咱们一起拆解。我准备好了，随时开局。'), buddy)}
          {reply(t('You can switch things up anytime on the Buddy page.', '之后随时都能在 Buddy 页面换个搭子。'), 'buddy-note')}
        </>}
      </>}
      <div ref={replies} className="iq-inline-replies">
      <ChatReplyCards role="group" aria-label={t('Reply to GameBuddy','回复 GameBuddy')}>
        {step < 2 && !selected && examples[step].map((item,i) => <button key={i} onClick={() => choose(i)}>{item.q[l]}</button>)}
        {step < 2 && selected && followups[step] === null && selected.follow.map((item,i) => <button key={i} onClick={() => setFollowups(v => v.map((x,j) => j === step ? i : x))}>{item[0][l]}</button>)}
        {step === 2 && !buddy && initialBuddies.map(b => <button key={b.id} onClick={() => setBuddy(b.id)}><strong>{b.name[l]}</strong><small>{b.description[l]}</small></button>)}
        {step < 2 && followups[step] !== null && <button onClick={() => setStep(step + 1)}>{step === 0 ? t('What else can you do?','你还会些什么？') : t('Let’s meet my Buddy','认识一下我的搭子')}</button>}
        {step === 2 && buddy && <button onClick={() => finish(true)}>{t('Let’s get started','走吧，开始体验')}</button>}
      </ChatReplyCards>
      </div>
      <div ref={latest}/>
  </OnboardingChatLayout>;
}
