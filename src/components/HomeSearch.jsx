import { cloneElement, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowUpRight, X, ChevronLeft, Copy, ThumbsUp, ThumbsDown, Share2, MoreHorizontal, Trash2 } from 'lucide-react';
import { BorderBeam } from 'border-beam';
import GameBuddyMark from './GameBuddyMark';
import { createPortal } from 'react-dom';
import AndroidKeyboard from './AndroidKeyboard';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

const rotatingHints = [
  ['Which TFT comp should I try?', '云顶之弈该试试什么阵容？'],
  ['Help me build a Hearthstone deck', '帮我组一套炉石传说卡组'],
  ['What should I upgrade in Clash Royale?', '皇室战争该先升级哪张卡？'],
  ['Find games like Slay the Spire', '找找像杀戮尖塔这样的游戏'],
  ['Which hero fits my Honor of Kings team?', '王者荣耀该选谁来补齐阵容？'],
  ['How should I position my Super Auto Pets?', '超级自动宠物该怎么安排站位？'],
];

// Svelte Bits SplitText entrance adapted to React and CSS.
// Attribution: public/licenses/svelte-bits.txt
function SplitTextHint({ language }) {
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const phrase = rotatingHints[reducedMotion ? 0 : index][language];
  useEffect(() => {
    if (reducedMotion) return;
    const duration = 600 + Math.max(0, Array.from(phrase).length - 1) * 20 + 1200;
    const timer = window.setTimeout(() => setIndex(value => (value + 1) % rotatingHints.length), duration);
    return () => window.clearTimeout(timer);
  }, [index, phrase, reducedMotion]);
  let characterIndex = 0;
  return <div className="hs-rotating-hint" aria-hidden="true">
    <span key={index} className="hs-split-hint">
      {reducedMotion ? phrase : phrase.split(/(\s+)/).map((word, wordIndex) => <span key={wordIndex} className="hs-split-word">
        {Array.from(word).map((character, offset) => <span key={offset} className="hs-split-char" style={{ animationDelay: `${characterIndex++ * 20}ms` }}>{character === ' ' ? '\u00a0' : character}</span>)}
      </span>)}
    </span>
  </div>;
}

function FadingHint({ language }) {
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  return <div className="hs-rotating-hint" aria-hidden="true">
    <span key={index} className="hs-fading-hint" onAnimationEnd={() => {
      if (!reducedMotion) setIndex(value => (value + 1) % rotatingHints.length);
    }}>{rotatingHints[reducedMotion ? 0 : index][language]}</span>
  </div>;
}

function HistoryStrip({ children, label }) {
  const strip = useRef(null);
  useLayoutEffect(() => {
    const element = strip.current;
    element.scrollLeft = (element.scrollWidth - element.clientWidth) / 2;
  }, []);
  return <div ref={strip} className="hs-v2-games" aria-label={label}>{children}</div>;
}

function TrendingRow({ items, renderItem, row, reducedMotion }) {
  const sequence = useRef(null);
  const track = useRef(null);
  useLayoutEffect(() => {
    const measure = () => {
      // Match the sign-in loop's gentle pixel speed and alternating directions.
      const speed = (13 + row * 2) * 0.3;
      track.current.style.animationDuration = `${sequence.current.offsetWidth / speed}s`;
    };
    const observer = new ResizeObserver(measure);
    observer.observe(sequence.current);
    measure();
    return () => observer.disconnect();
  }, [row]);
  return <div className="hs-trending-lane">
    <div ref={track} className="hs-rotation-track" style={{ animationDirection: row % 2 ? 'reverse' : 'normal' }}>
      {(reducedMotion ? [0] : [0, 1]).map(copy => <ul ref={copy === 0 ? sequence : undefined} key={copy} className="hs-rotation-group" aria-hidden={copy === 1 ? true : undefined}>
        {items.map((game, position) => <li key={game.id || game.short}>
          {copy === 1 ? cloneElement(renderItem(game, position), { tabIndex: -1 }) : renderItem(game, position)}
        </li>)}
      </ul>)}
    </div>
  </div>;
}

function RotatingTrending({ items, renderItem, expanded }) {
  const reducedMotion = useReducedMotion();
  if (expanded) return <ul className="hs-trending-expanded">{items.map((game, index) => <li key={game.id || `${game.short}-${index}`}>{renderItem(game, index)}</li>)}</ul>;
  return <div className={`hs-trending-rotation${reducedMotion ? ' hs-trending-static' : ''}`}>
    {Array.from({ length: 2 }, (_, row) => <TrendingRow key={row} row={row} items={items.filter((_, index) => index % 2 === row)} renderItem={renderItem} reducedMotion={reducedMotion} />)}
  </div>;
}

// Seeded per-game conversations for the Home history demo.
const gameHistory = [
  { id: 'dungeon-run', title: ['My dungeon run', '我的地牢冒险'], messages: [
    ['Which weapon should I keep for this run?', '这次冒险该保留哪把武器？'],
    ['Keep one reliable weapon for regular rooms and save your higher-damage option for the boss.', '保留一把适合清理普通房间的武器，把高伤害武器留给首领。'],
    ['What should I look for next?', '接下来该优先找什么？'],
    ['Look for healing and upgrades that support the weapon you use most.', '优先寻找回复道具和适合主力武器的升级。'],
  ] },
  { id: 'tft', title: ['Teamfight Tactics', '云顶之弈'], image: 'trending-tft.png', messages: [
    ['Should I roll or save my gold?', '现在该刷新商店还是存金币？'],
    ['If your board is stable, save. If you are losing too much health, roll enough to strengthen your frontline.', '如果阵容够稳就存金币。如果掉血太快，就适当刷新来提升前排。'],
    ['What about positioning?', '站位该怎么调整？'],
    ['Protect your main carry behind your frontline and watch where the strongest opponent places their threats.', '让前排保护主力输出，并留意最强对手的关键单位位置。'],
  ] },
  { id: 'armor', title: ['Armor & upgrades', '护甲与升级'], messages: [
    ['Should I upgrade my armor now?', '现在该升级护甲吗？'],
    ['Upgrade if incoming damage is stopping your progress. Otherwise, keep some resources for your next equipment choice.', '如果承受的伤害已经影响推进，就升级护甲。否则可以留些资源给下一件装备。'],
  ] },
  { id: 'cookies', title: ['Cookie Clicker', 'Cookie Clicker'], messages: [
    ['Which upgrade should I buy next?', '接下来该买哪个升级？'],
    ['Compare the extra cookies per second against the price. Prioritize the upgrade that pays for itself sooner.', '比较每个升级带来的每秒产量与价格，优先购买回本更快的升级。'],
    ['Should I save for a more expensive building?', '该攒钱买更贵的建筑吗？'],
    ['Check how long you would need to wait and whether cheaper upgrades would improve your production during that time.', '先看看需要等待多久，再比较便宜的升级能否在这段时间内提高产量。'],
  ] },
  { id: 'weapons', title: ['Weapon builds', '武器搭配'], messages: [
    ['How can I improve this weapon build?', '这套武器搭配该怎么改进？'],
    ['Focus your upgrades on one main source of damage, then use the remaining slots for survival and utility.', '把升级集中在一种主要伤害来源上，再用剩余位置补充生存和辅助能力。'],
  ] },
  {"id": "auto-pirates", "title": ["Auto Pirates", "Auto Pirates"], "image": "auto-pirates.png", "messages": [["Which crew member should I upgrade?", "该升级哪位船员？"], ["Start with the crew member your strategy relies on most.", "优先升级最符合当前战术的核心船员。"]]},
  {"id": "underlords", "title": ["Dota Underlords", "刀塔霸业"], "image": "underlords.png", "messages": [["How should I protect my damage dealers?", "该怎么保护输出单位？"], ["Keep them behind your frontline and adjust to enemy positioning.", "把输出放在前排后方，并根据敌方站位调整。"]]},
  {"id": "auto-pets", "title": ["Super Auto Pets", "超级自动宠物"], "image": "auto-pets.png", "messages": [["Should I save this pet for next turn?", "该把这只宠物留到下回合吗？"], ["Keep it if it supports your current team or a useful upgrade.", "如果它能配合现有队伍或帮助升级，就保留下来。"]]},
  {"id": "cassette-beasts", "title": ["Cassette Beasts", "磁带妖怪"], "image": "cassette-beasts.png", "messages": [["Which monster should I add to my team?", "队伍该加入哪只怪物？"], ["Choose one that covers a weakness in your current lineup.", "选择能弥补当前阵容弱点的怪物。"]]},
  {"id": "anglerwood", "title": ["Spirits of Anglerwood Forest", "Spirits of Anglerwood Forest"], "image": "anglerwood.jpg", "messages": [["What should I prepare before nightfall?", "天黑前该准备什么？"], ["Plan your route and gather the supplies you need before heading out.", "出发前规划路线并准备好所需物资。"]]},
  {"id": "shotgun-king", "title": ["Shotgun King", "Shotgun King"], "image": "shotgun-king.jpg", "messages": [["Is it safer to move or shoot here?", "这里移动还是开枪更安全？"], ["Check which squares are threatened before committing to your next move.", "行动前先检查哪些格子受到威胁。"]]},
  {"id": "sigma-theory", "title": ["Sigma Theory", "Sigma Theory"], "image": "sigma-theory.jpg", "messages": [["Which agent should take this mission?", "该让哪位特工执行这个任务？"], ["Match the agent’s strengths to the mission and consider the risk.", "根据任务需求选择擅长的特工，同时考虑风险。"]]},
];

const gameIntroductions = {
  tft: ['Draft champions, build a team, and outlast your opponents in this strategy auto-battler.', '招募英雄、搭配阵容，在策略自走棋对战中击败对手。', 'https://teamfighttactics.leagueoflegends.com/en-us/'],
  cookies: ['Build a cookie-making empire by clicking, buying buildings, and unlocking production upgrades.', '从点击制作饼干开始，购买建筑并解锁升级，逐步打造你的饼干帝国。'],
  'auto-pirates': ['Assemble a pirate crew and experiment with team combinations in a strategic auto-battler.', '组建海盗船员阵容，在策略自动战斗中尝试不同搭配。'],
  underlords: ['Hire a crew of Dota heroes, combine their strengths, and battle for control of White Spire.', '招募 Dota 英雄、搭配队伍，在自动战斗中争夺白色尖塔的控制权。', 'https://www.underlords.com/'],
  'auto-pets': ['Build a team of animals with different abilities and combine their strengths in automatic battles.', '组建拥有不同技能的宠物队伍，利用配合赢得自动战斗。', 'https://teamwoodgames.com/'],
  'cassette-beasts': ['Record monsters on cassette tapes, transform into them in battle, and fuse forms to discover new combinations.', '用磁带录制怪物，在战斗中变身，并通过融合探索新的形态组合。', 'https://www.cassettebeasts.com/cassette-beasts/'],
  anglerwood: ['Explore a haunted forest and light lanterns while avoiding the spirit that pursues you.', '探索闹鬼的森林，点亮灯笼，并躲避追逐你的幽灵。'],
  'shotgun-king': ['A turn-based chess roguelike where your lone king carries a shotgun. Plan every move and shot carefully.', '一款回合制国际象棋 Roguelike。你独自操控持霰弹枪的国王，每次移动与射击都需要规划。'],
  'sigma-theory': ['Lead a team of agents in a strategy game about espionage, diplomacy, and a world-changing scientific discovery.', '带领特工队伍，通过谍报与外交争夺足以改变世界的科学发现。'],
};

function AnswerActions({ answerRef, chinese }) {
  const [vote, setVote] = useState(null);
  const [notice, setNotice] = useState('');
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 2400);
    return () => clearTimeout(timer);
  }, [notice]);
  function answerText() {
    const node = answerRef.current;
    const links = Array.from(node?.querySelectorAll('a') || []).map(link => link.href);
    return [node?.innerText || '', ...links].join('\n');
  }
  async function copy() {
    try { await navigator.clipboard.writeText(answerText()); setNotice(chinese ? '已复制' : 'Copied'); }
    catch { setNotice(chinese ? '复制失败，请选中文字复制' : 'Could not copy. Select the text to copy it.'); }
  }
  async function share() {
    try {
      if (navigator.share) await navigator.share({ title: 'GameBuddy', text: answerText() });
      else { await navigator.clipboard.writeText(answerText()); setNotice(chinese ? '已复制，可粘贴分享' : 'Copied — ready to share'); }
    } catch (error) { if (error.name !== 'AbortError') setNotice(chinese ? '暂时无法分享' : 'Could not share'); }
  }
  return <div className="hs-answer-actions">
    <button type="button" aria-label={chinese ? '复制回答' : 'Copy answer'} onClick={copy}><Copy/></button>
    <button type="button" aria-label={chinese ? '赞' : 'Like answer'} aria-pressed={vote === 'like'} onClick={() => setVote(value => value === 'like' ? null : 'like')}><ThumbsUp/></button>
    <button type="button" aria-label={chinese ? '踩' : 'Dislike answer'} aria-pressed={vote === 'dislike'} onClick={() => setVote(value => value === 'dislike' ? null : 'dislike')}><ThumbsDown/></button>
    <button type="button" aria-label={chinese ? '分享回答' : 'Share answer'} onClick={share}><Share2/></button>
    <span role="status">{notice}</span>
  </div>;
}

function BuddyAnswer({ children, chinese }) {
  const answer = useRef(null);
  return <div className="hs-feed-message hs-feed-buddy"><div ref={answer}>{children}</div><AnswerActions answerRef={answer} chinese={chinese}/></div>;
}

function SearchDetailPage({ history, chinese, theme, onBack, onDelete }) {
  const [sent, setSent] = useState([]);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const feed = useRef(null);
  useEffect(() => { if (sent.length) feed.current?.scrollTo({ top: feed.current.scrollHeight, behavior: "smooth" }); }, [sent]);
  useLayoutEffect(() => {
    const element = feed.current;
    let previousHeight = element.clientHeight;
    const observer = new ResizeObserver(() => {
      const height = element.clientHeight;
      // Preserve the visible conversation's bottom edge as the keyboard resizes it.
      element.scrollTop += previousHeight - height;
      previousHeight = height;
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  async function sendMessage({ text, photo }) {
    let image = photo;
    if (photo?.startsWith("blob:")) {
      const blob = await fetch(photo).then(response => response.blob());
      image = await new Promise(resolve => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.readAsDataURL(blob); });
    }
    setSent(current => [...current, { text, image }]);
  }
  const l = chinese ? 1 : 0;
  const title = history.title[l];
  const intro = gameIntroductions[history.id];
  const download = intro?.[2] || `https://www.taptap.io/search/${encodeURIComponent(history.title[0])}`;
  const message = (role, content, key) => role === 'buddy'
    ? <BuddyAnswer key={key} chinese={chinese}>{content}</BuddyAnswer>
    : <div key={key} className="hs-feed-message hs-feed-user">{content}</div>;
  return <section className="hs-game-feed" style={{ height: `calc(100% - ${keyboardHeight}px)` }}>
    <header className="hs-feed-header">
      <button type="button" className="hs-feed-back" onClick={onBack} aria-label={chinese ? '返回首页' : 'Back to Home'}><ChevronLeft size={20}/></button>
      <img src={`${import.meta.env.BASE_URL}assets/${history.image || `home-v2-game-${gameHistory.indexOf(history) + 1}.png`}`} alt=""/>
      <div><h1>{title}</h1></div>
      <details className="hs-history-menu" onKeyDown={event => { if (event.key === 'Escape') { event.currentTarget.open = false; event.currentTarget.querySelector('summary').focus(); } }} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false; }}>
        <summary aria-label={chinese ? '更多选项' : 'More options'}><MoreHorizontal aria-hidden="true"/></summary>
        <div className="hs-history-menu-panel"><button type="button" onClick={onDelete}><Trash2 aria-hidden="true"/>{chinese ? '删除搜索记录' : 'Delete search history'}</button></div>
      </details>
    </header>
    <div ref={feed} className="hs-feed-messages" role="log" aria-label={title}>
      {message('user', <p>{chinese ? `帮我找一下《${title}》的游戏介绍。` : `Find an introduction to ${title}.`}</p>, 'request')}
      {message('buddy', <><p>{intro ? intro[l] : chinese ? '这个游戏图标的名称待确认，确认后会补充对应的介绍和下载入口。' : 'This game icon still needs a confirmed name before its introduction and download page can be added.'} {intro && <>{chinese ? '你可以' : 'You can '}<a className="hs-feed-download" href={download} target="_blank" rel="noreferrer">{chinese ? (intro[2] ? '在官网获取游戏' : '在 TapTap 查找下载') : (intro[2] ? 'get the game on its official site' : 'find it on TapTap')}</a>{chinese ? '。' : '.'}</>}</p></>, 'intro')}
      {message('buddy', <p>{chinese ? `想试试《${title}》，并开启 GameAssist 吗？开启后，我可以结合游戏画面和声音提供帮助。` : `Would you like to play ${title} with GameAssist? I can use your game screen and audio to help as you play.`}</p>, 'invite')}
      {message('user', <p>{chinese ? '好，开启 GameAssist。我同意在游戏辅助期间共享屏幕、录制游戏画面、访问游戏音频，并使用麦克风进行语音交流。' : 'Yes, enable GameAssist. I agree to share my screen, record gameplay, share game audio, and use my microphone for voice chat during the session.'}</p>, 'consent')}
      {sent.map((item, index) => message('user', <>{item.image && <img className="hs-sent-image" src={item.image} alt={chinese ? '发送的截图' : 'Sent screenshot'}/>}<p>{item.text}</p></>, `sent-${index}`))}
    </div>
    <div className="hs-detail-composer"><HomeSearch composerOnly beam={false} chinese={chinese} theme={theme} gameDownloaded={history.downloaded === true} gameDownloadUrl={download} onSendMessage={sendMessage} onKeyboardHeight={setKeyboardHeight}/></div>
  </section>;
}

const visibleCardCount = 10;
// Illustrative people counts, stable per question; not live search analytics.
const demoHeat = [9400, 7000, 5600, 3900, 3200, 3900];
const formatHeat = (count, chinese) => chinese && count >= 10000
  ? `${(count / 10000).toFixed(1)}万`
  : `${(count / 1000).toFixed(1)}k`;
// Figma game picks with illustrative questions, not measured live trends.
const games = [{"name": ["Teamfight Tactics", "云顶之弈"], "short": "TFT", "image": "tft", "question": ["Should I spend gold to stabilize?", "该花金币稳住血量吗？"]}, {"name": ["Auto Pirates: Captains Cup", "Auto Pirates: Captains Cup"], "short": "AP", "image": "auto-pirates", "question": ["How can I improve my crew?", "我的船员阵容该怎么改进？"]}, {"name": ["Dota Underlords", "刀塔霸业"], "short": "DU", "image": "underlords", "question": ["How should I position my team?", "我的阵容该怎么站位？"]}, {"name": ["Super Auto Pets", "超级自动宠物"], "short": "SAP", "image": "auto-pets", "question": ["Which pet should I upgrade next?", "接下来该升级哪只宠物？"]}, {"name": ["Cassette Beasts", "磁带妖怪"], "short": "CB", "image": "cassette-beasts", "question": ["How can I improve my team?", "我的队伍该怎么改进？"], "layout": "compact"}, {"name": ["Spirits of Anglerwood Forest", "Spirits of Anglerwood Forest"], "short": "SAF", "image": "anglerwood", "imageExtension": "jpg", "question": ["How do I survive the night?", "怎样才能平安度过夜晚？"], "layout": "compact", "url": "https://minireview.io/adventure/spirits-of-anglerwood-forest"}, {"name": ["Shotgun King", "Shotgun King"], "short": "shotgun-king", "image": "shotgun-king", "imageExtension": "jpg", "question": ["When should I shoot or move?", "什么时候该开枪，什么时候该移动？"], "layout": "compact", "url": "https://minireview.io/board/shotgun-king"}, {"name": ["Baldeouj", "Baldeouj"], "short": "baldeouj", "image": "baldeouj", "imageExtension": "jpg", "question": ["Which resources should I save?", "哪些资源应该留着用？"], "layout": "compact", "url": "https://minireview.io/strategy/baldeouj"}, {"name": ["2112TD: Tower Defense Survival", "2112TD: Tower Defense Survival"], "short": "2112td-tower-defense-survival", "image": "2112td-tower-defense-survival", "imageExtension": "jpg", "question": ["Where should I place my towers?", "防御塔该放在哪里？"], "layout": "compact", "url": "https://minireview.io/tower-defense/2112td-tower-defense-survival"}, {"name": ["Sigma Theory", "Sigma Theory"], "short": "sigma-theory", "image": "sigma-theory", "imageExtension": "jpg", "question": ["How should I manage my agents?", "我该如何安排特工？"], "layout": "compact", "url": "https://minireview.io/strategy/sigma-theory"}];
// Additional bilingual prompts for the twenty-item rotating demo feed.
const moreTrendingQuestions = [
  ['When should I level up instead of rolling?', '什么时候该升级而不是刷新商店？'],
  ['Which crew member should I replace?', '该换掉哪位船员？'],
  ['Which alliance should I build around?', '该围绕哪个联盟组建阵容？'],
  ['Should I combine my pets or keep them separate?', '该合并宠物还是分开保留？'],
  ['Which monster should I record next?', '接下来该录制哪只怪物？'],
  ['What should I prepare before exploring?', '出发探索前该准备什么？'],
  ['Which upgrade should I choose for the next floor?', '下一层该选哪个升级？'],
  ['How can I recover after a bad start?', '开局不顺该怎么挽回？'],
  ['How do I stop enemies from breaking through?', '怎么防止敌人突破防线？'],
  ['Which mission should I send my agents on?', '该派特工执行哪个任务？'],
];
const rotatingTrendingGames = [
  ...games,
  ...games.map((game, index) => ({ ...game, id: `${game.short}-followup`, question: moreTrendingQuestions[index] })),
];

// Seeded search history for the demo.
const initialSearches = [{"image": "recent-1", "question": ["How can I improve this team?", "这个队伍该怎么改进？"]}, {"image": "recent-2", "question": ["What should I upgrade next?", "接下来该升级什么？"]}, {"image": "recent-3", "question": ["How do I beat this boss?", "这个首领该怎么打？"]}, {"image": "recent-4", "question": ["Which build should I try?", "我该尝试什么配装？"]}, {"image": "recent-5", "question": ["How should I position my units?", "我的单位该怎么站位？"]}];
const ui = [
 { eyebrow: 'YOUR NEXT MOVE STARTS HERE', title: 'What should we play today?', intro: 'Comps, counters, and the “what now?”', placeholder: 'What should we play today?', screenshot: 'Search with a screenshot', imageHint: 'Your board. Your deck. Your next move.', trending: 'Trending searches', examples: 'Demo picks', filters: ['All', 'Auto-battlers', 'Strategy'], any: 'Built for strategy. Curious about any game.', voice: 'Voice search', voiceHint: 'Voice input isn’t available here. Type your question instead.', listening: 'Listening… tap to stop', empty: 'Type a question or add a screenshot.', result: 'Answer preview', demo: 'Sample answer · demo', source: 'Read the source', generic: 'This preview shows how a search will look. Live answers and screenshot analysis will be connected in a later version.', remove: 'Remove screenshot', back: 'Back to search' },
 { eyebrow: '下一步，从这里开始', title: '今天，我们玩点什么？', intro: '阵容、克制，还有每一个「怎么办」。', placeholder: '今天我们玩点什么？', screenshot: '用截图找答案', imageHint: '看懂棋盘、卡组和你的下一步。', trending: '大家都在搜', examples: '演示精选', filters: ['全部', '自走棋', '策略'], any: '专注策略，也懂你的其他游戏好奇。', voice: '语音搜索', voiceHint: '当前环境不支持语音输入，请直接输入问题。', listening: '正在聆听…点击停止', empty: '输入问题，或添加一张截图。', result: '答案预览', demo: '示例答案 · 演示', source: '查看资料来源', generic: '这里展示搜索后的交互效果。实时答案与截图分析将在后续版本接入。', remove: '移除截图', back: '返回搜索' }
];
export default function HomeSearch({ chinese, theme, nickname = 'Frankie', onOpenAccount, onSearchDetailChange, onSendMessage, onKeyboardHeight, gameDownloaded = false, gameDownloadUrl, composerOnly = false, beam = true, layout = 'v1' }) {
  const v2 = layout === 'v2' && !composerOnly;
  const reducedMotion = useReducedMotion();
  const detailTransition = { duration: reducedMotion ? 0 : .5, ease: [.4, 0, .2, 1] };
  const l = chinese ? 1 : 0, c = ui[l];
  const name = nickname?.trim();
  const searchHint = name ? (chinese ? `${name}，${c.placeholder}` : `${name}, ${c.placeholder.charAt(0).toLowerCase()}${c.placeholder.slice(1)}`) : c.placeholder;
  const [query, setQuery] = useState(''), [result, setResult] = useState(null), [notice, setNotice] = useState(false), [listening, setListening] = useState(false), [photo, setPhoto] = useState(null);
  const file = useRef(null), speech = useRef(null), searchInput = useRef(null);
  const [showAllTrending, setShowAllTrending] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [keyboardHost, setKeyboardHost] = useState(null);
  useEffect(() => {
    if (!onKeyboardHeight) return;
    const keyboard = keyboardOpen && keyboardHost?.querySelector('.android-keyboard');
    if (!keyboard) { onKeyboardHeight(0); return; }
    const measure = () => onKeyboardHeight(keyboard.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(keyboard);
    return () => { observer.disconnect(); onKeyboardHeight(0); };
  }, [keyboardOpen, keyboardHost, onKeyboardHeight]);
  const [attachmentActive, setAttachmentActive] = useState(false);
  const [attachmentExpanded, setAttachmentExpanded] = useState(false);
  const composer = useRef(null);
  const [activeHistory, setActiveHistory] = useState(null);
  const [deletedHistories, setDeletedHistories] = useState(() => {
    try { const saved = JSON.parse(localStorage.getItem('gb-deleted-search-history') || '[]'); return Array.isArray(saved) ? saved : []; } catch { return []; }
  });
  const visibleHistories = gameHistory.filter(history => !deletedHistories.includes(history.id));
  function deleteHistory() {
    const next = [...deletedHistories, activeHistory.id];
    setDeletedHistories(next);
    try { localStorage.setItem('gb-deleted-search-history', JSON.stringify(next)); } catch {}
    setActiveHistory(null);
  }
  useEffect(() => {
    if (activeHistory) onSearchDetailChange?.(true);
  }, [activeHistory, onSearchDetailChange]);
  useEffect(() => () => onSearchDetailChange?.(false), [onSearchDetailChange]);
  const showRotatingHint = !composerOnly && !query && !keyboardOpen && !attachmentActive && !photo && !listening;

  useEffect(() => {
    if (!attachmentActive) return;
    const closeOutside = e => {
      if (!composer.current?.contains(e.target)) {
        setAttachmentActive(false);
        setAttachmentExpanded(false);
      }
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [attachmentActive]);
  function dismissKeyboard() { setKeyboardOpen(false); searchInput.current?.blur(); }
  function typeKey(key) {
    const input = searchInput.current;
    if (!input) return;
    let start = input.selectionStart, end = input.selectionEnd;
    if (key === 'Backspace' && start === end && start > 0) {
      const previous = Array.from(query.slice(0, start)).pop();
      start -= previous.length;
    }
    const insertion = key === 'Backspace' ? '' : key;
    setQuery(query.slice(0, start) + insertion + query.slice(end));
    requestAnimationFrame(() => {
      input.focus({ preventScroll: true });
      input.setSelectionRange(start + insertion.length, start + insertion.length);
    });
  }
  const [recentSearches, setRecentSearches] = useState(initialSearches);
  const suggestions = games.slice(0, visibleCardCount).map((game, index) => ({
    ...game, heat: demoHeat[index]
  }));
  useEffect(() => () => speech.current?.abort(), []);
  useEffect(() => () => { if (photo) URL.revokeObjectURL(photo); }, [photo]);
  async function submit(e) { e.preventDefault(); if (!query.trim() && !photo) return; if (onSendMessage) { await onSendMessage({ text: query.trim(), photo }); setQuery(''); setPhoto(null); speech.current?.abort(); return; } dismissKeyboard(); setAttachmentActive(false); setAttachmentExpanded(false); speech.current?.abort(); setRecentSearches(current => [{ image: 'tft', question: [query.trim() || 'Screenshot search', query.trim() || '截图搜索'] }, ...current].slice(0, 10)); setResult({ question: query.trim(), game: null }); }
  function voice() {
    if (listening) { speech.current?.stop(); return; }
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) { setNotice(true); return; }
    setNotice(false);
    const rec = new Recognition(); speech.current = rec; rec.lang = chinese ? 'zh-CN' : 'en-US';
    rec.onstart = () => setListening(true); rec.onend = () => setListening(false);
    rec.onerror = () => { setNotice(true); setListening(false); };
    rec.onresult = e => setQuery(e.results[0][0].transcript);
    try { rec.start(); } catch { setNotice(true); }
  }
  if (result) return <section className="hs-result"><button className="hs-back" onClick={() => setResult(null)}><ChevronLeft size={18}/>{c.back}</button><span className="hs-kicker">{c.result}</span><h2>{result.game ? result.game.question[l] : result.question || c.screenshot}</h2>{photo && <img className="hs-result-photo" src={photo} alt={c.screenshot}/>}<div className="hs-answer"><GameBuddyMark/><span>{c.demo}</span><p>{result.game?.answer ? result.game.answer[l] : c.generic}</p>{result.game?.url && <a href={result.game.url} target="_blank" rel="noreferrer">{c.source}<ArrowUpRight size={14}/></a>}</div></section>;
  const SearchFrame = beam && !v2 ? BorderBeam : 'div';
  const beamProps = beam && !v2 ? {size:'line',colorVariant:'mono',theme,duration:2.4,strength:0.4} : {};
  const art = (name, extension = 'svg') => `${import.meta.env.BASE_URL}assets/${name}.${extension}`;
  return <><motion.section inert={!!activeHistory} animate={{ x: activeHistory && !reducedMotion ? "-20%" : 0 }} transition={detailTransition} className={`hs-home${v2 ? ' hs-home-v2' : ''}${keyboardOpen || attachmentActive ? ' hs-search-active' : ''}${keyboardOpen || (attachmentActive && attachmentExpanded) ? ' hs-is-typing' : ''}`}>
    {!composerOnly && <div className="hs-top"><div className="hs-brand"><img src={art(v2 ? 'home-v2-mark' : 'brand')} alt=""/><span>{v2 ? 'GameBUDDY' : 'GameBuddy'}</span></div><button className="hs-profile" aria-label={chinese ? '个人资料' : 'Your profile'} onClick={() => { dismissKeyboard(); onOpenAccount(); }}><img src={art('profile-dog', 'png')} alt=""/></button></div>}
    {v2 && <h1 className="hs-v2-greeting">{chinese ? <>Frankie，准备好发现<br />下一款游戏了吗？</> : <>Frankie, ready to find<br />your next game?</>}</h1>}
    <SearchFrame className="hs-search-beam" {...beamProps}>
    <form ref={composer} className="hs-search" onSubmit={submit}>
      {showRotatingHint && (v2 ? <FadingHint key={l} language={l} /> : <SplitTextHint key={l} language={l} />)}
      <textarea ref={searchInput} inputMode="none" onFocus={e => { setKeyboardHost(e.currentTarget.closest('.gb-home')); setKeyboardOpen(true); setAttachmentActive(false); }} onBlur={e => {
        if (e.relatedTarget?.closest('.hs-add')) {
          setAttachmentExpanded(true);
          setAttachmentActive(true);
        }
        setKeyboardOpen(false);
      }} rows="2" aria-label={searchHint} placeholder={composerOnly ? (chinese ? '发消息给 GameBuddy' : 'Message GameBuddy') : ''} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {e.preventDefault(); submit(e);} }}/>
      {photo && <div className="hs-attachment"><img src={photo} alt={c.screenshot}/><button type="button" aria-label={c.remove} onClick={() => setPhoto(null)}><X size={15}/></button></div>}
      <div className="hs-search-actions"><button type="button" className="hs-add" title={c.screenshot} aria-label={c.screenshot} onPointerDown={() => {
        setAttachmentExpanded(keyboardOpen || attachmentExpanded || !!query.trim());
        setAttachmentActive(true);
      }} onClick={() => { setAttachmentActive(true); file.current.click(); }}><img src={art('add-circle')} alt=""/></button>{composerOnly && onSendMessage && (gameDownloaded ? <button type="button" className="hs-play" onPointerDown={event => event.preventDefault()} onClick={() => onSendMessage({ text: chinese ? '我想开始玩这款游戏。' : 'I’d like to play this game.', photo: null })}>{chinese ? '玩游戏' : 'Play'}</button> : <a className="hs-play hs-get-game" href={gameDownloadUrl} target="_blank" rel="noreferrer" onPointerDown={event => event.preventDefault()}>{chinese ? '玩游戏' : 'Play'}</a>)}<div className="hs-right-actions"><button type="button" className="hs-mic" aria-label={listening ? c.listening : c.voice} aria-pressed={listening} onClick={voice}><img src={art('mic')} alt=""/></button>{query.trim() || photo ? <button className="hs-submit" aria-label={c.result} onPointerDown={e => e.preventDefault()}><img className="hs-send-circle" src={art('send-circle')} alt=""/><img className="hs-send-arrow" src={art('send-arrow')} alt=""/></button> : <button type="button" className="hs-voice" aria-label={listening ? c.listening : c.voice} aria-pressed={listening} onClick={voice}><img src={art('voice')} alt=""/></button>}</div></div>
      <input className="hs-file" type="file" accept="image/*" ref={file} onCancel={() => {
        if (!attachmentExpanded) setAttachmentActive(false);
      }} onChange={e => { const f=e.target.files?.[0]; if(f?.type.startsWith('image/')) setPhoto(URL.createObjectURL(f)); e.target.value=''; }}/>
    </form>
    </SearchFrame>
    {(notice || listening) && <p className="hs-notice" role="status">{listening ? c.listening : c.voiceHint}</p>}
    {v2 && <HistoryStrip label={chinese ? '搜索记录' : 'Search history'}>
      {visibleHistories.map((history, index) => <button key={history.id} type="button" title={history.title[l]} aria-label={chinese ? `打开${history.title[l]}的聊天记录` : `Open chat history: ${history.title[l]}`} onClick={() => {
        dismissKeyboard();
        speech.current?.abort();
        setActiveHistory(history);
      }}><img src={`${import.meta.env.BASE_URL}assets/${history.image || `home-v2-game-${gameHistory.indexOf(history) + 1}.png`}`} alt="" /></button>)}
    </HistoryStrip>}
    {v2 && <section className="hs-v2-trending" aria-label={chinese ? '大家都在搜什么？' : 'Trending Search'}>
      <RotatingTrending expanded={showAllTrending} items={rotatingTrendingGames} renderItem={(game, index) => (
          <button type="button" className="hs-v2-trending-row" onClick={() => {
            dismissKeyboard();
            speech.current?.abort();
            setResult({ game });
          }}>
            <span className="hs-v2-trending-copy">
              <strong>{game.question[l]}</strong>
              <span className="hs-v2-trending-game">
                <img src={art(game.short === 'TFT' ? 'trending-tft' : game.image, game.imageExtension || 'png')} alt="" />
                <span>{game.name[l]}</span>
              </span>
            </span>
          </button>
      )} />
      <button type="button" className="hs-more-trending" aria-expanded={showAllTrending} onClick={() => setShowAllTrending(value => !value)}>{showAllTrending ? (chinese ? '收起' : 'Show less') : (chinese ? '更多热门搜索' : 'More Trending')}</button>
    </section>}
    {!composerOnly && !v2 && <>
    <section className="hs-history" aria-labelledby="my-searches-heading">
      <h2 id="my-searches-heading" className="hs-section-heading">{chinese ? '我的搜索' : 'My searches'}</h2>
      <div className="hs-history-strip">{visibleHistories.map((history, index) => <button className="hs-history-card" key={history.id} title={history.title[l]} aria-label={chinese ? `打开${history.title[l]}的聊天记录` : `Open chat history: ${history.title[l]}`} onClick={() => { dismissKeyboard(); speech.current?.abort(); setActiveHistory(history); }}><img src={`${import.meta.env.BASE_URL}assets/${history.image || `home-v2-game-${gameHistory.indexOf(history) + 1}.png`}`} alt=""/></button>)}</div>
    </section>
    <h2 className="hs-section-heading hs-trending-heading">{chinese ? '热搜' : 'Trending'}</h2>
    <div className="hs-questions" aria-label={chinese ? '游戏问题推荐' : 'Suggested game questions'}>{suggestions.map((g, slot)=><button key={slot} className={`hs-question${g.layout ? ` hs-question-${g.layout}` : ''}`} data-game={g.short} onClick={()=>{speech.current?.abort();setResult({game:g});}}><img className="hs-game-icon" src={art(g.image,g.imageExtension || 'png')} alt=""/>{g.layout !== 'compact' && <span className="hs-heat" title={chinese ? `演示数据：${g.heat.toLocaleString('zh-CN')} 人在问` : `Demo count: ${g.heat.toLocaleString('en-US')} people asking`} aria-label={chinese ? `演示热度：${g.heat} 人在问` : `Sample popularity: ${g.heat} people asking`}><img src={art('heat')} alt=""/><span>{formatHeat(g.heat, chinese)}</span></span>}<span className="hs-question-copy"><span className="hs-game-name">{g.name[l]}</span><strong>{g.question[l]}</strong></span></button>)}</div>
    </>}
    {keyboardOpen && keyboardHost && createPortal(<AndroidKeyboard chinese={chinese} onKey={typeKey} onDismiss={dismissKeyboard} onSearch={() => submit({ preventDefault() {} })}/>, keyboardHost)}
  </motion.section>
  <AnimatePresence initial={false} onExitComplete={() => onSearchDetailChange?.(false)}>
    {activeHistory && <motion.div key="search-detail" className="hs-detail-layer" initial={{ x: reducedMotion ? 0 : '100%', opacity: reducedMotion ? 1 : .8 }} animate={{ x: 0, opacity: 1 }} exit={{ x: reducedMotion ? 0 : '100%', opacity: reducedMotion ? 1 : .8 }} transition={detailTransition}>
      <SearchDetailPage history={activeHistory} chinese={chinese} theme={theme} onDelete={deleteHistory} onBack={() => setActiveHistory(null)} />
    </motion.div>}
  </AnimatePresence></>;
}
