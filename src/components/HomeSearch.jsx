import { cloneElement, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowUpRight, X, ChevronLeft } from 'lucide-react';
import { BorderBeam } from 'border-beam';
import GameBuddyMark from './GameBuddyMark';
import { createPortal } from 'react-dom';
import AndroidKeyboard from './AndroidKeyboard';
import { useReducedMotion } from 'framer-motion';

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

function RotatingTrending({ items, renderItem }) {
  const reducedMotion = useReducedMotion();
  if (reducedMotion) return <ol className="hs-v2-trending-list">{items.map((game, position) => <li key={game.id || game.short}>{renderItem(game, position)}</li>)}</ol>;
  return <div className="hs-trending-rotation">
    <div className="hs-rotation-track" style={{ animationDuration: `${items.length * 4}s` }}>
      {[0, 1].map(copy => <ol key={copy} className="hs-rotation-group" aria-hidden={copy === 1 ? true : undefined}>
        {items.map((game, position) => <li key={game.id || game.short}>
          {copy === 1 ? cloneElement(renderItem(game, position), { tabIndex: -1 }) : renderItem(game, position)}
        </li>)}
      </ol>)}
    </div>
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
  { id: 'tft', title: ['Teamfight Tactics', '云顶之弈'], messages: [
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

function GameHistoryFeed({ history, chinese, onBack }) {
  const l = chinese ? 1 : 0;
  return <section className="hs-game-feed">
    <header className="hs-feed-header">
      <button type="button" className="hs-feed-back" onClick={onBack} aria-label={chinese ? '返回首页' : 'Back to Home'}><ChevronLeft size={20}/></button>
      <img src={`${import.meta.env.BASE_URL}assets/${history.image || `home-v2-game-${gameHistory.indexOf(history) + 1}.png`}`} alt=""/>
      <div><h1>{history.title[l]}</h1><span>{chinese ? '搜索记录' : 'Search history'}</span></div>
    </header>
    <div className="hs-feed-messages" role="log" aria-label={history.title[l]}>
      {history.messages.map((message, index) => <div key={index} className={`hs-feed-message ${index % 2 ? 'hs-feed-buddy' : 'hs-feed-user'}`}>
        <span className="hs-feed-author">{index % 2 ? 'GameBuddy' : chinese ? '你' : 'You'}</span>
        <p>{message[l]}</p>
      </div>)}
    </div>
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
export default function HomeSearch({ chinese, theme, nickname = 'Frankie', onOpenAccount, composerOnly = false, beam = true, layout = 'v1' }) {
  const v2 = layout === 'v2' && !composerOnly;
  const l = chinese ? 1 : 0, c = ui[l];
  const name = nickname?.trim();
  const searchHint = name ? (chinese ? `${name}，${c.placeholder}` : `${name}, ${c.placeholder.charAt(0).toLowerCase()}${c.placeholder.slice(1)}`) : c.placeholder;
  const [query, setQuery] = useState(''), [result, setResult] = useState(null), [notice, setNotice] = useState(false), [listening, setListening] = useState(false), [photo, setPhoto] = useState(null);
  const file = useRef(null), speech = useRef(null), searchInput = useRef(null);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [keyboardHost, setKeyboardHost] = useState(null);
  const [attachmentActive, setAttachmentActive] = useState(false);
  const [attachmentExpanded, setAttachmentExpanded] = useState(false);
  const composer = useRef(null);
  const [activeHistory, setActiveHistory] = useState(null);
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
  function submit(e) { e.preventDefault(); if (!query.trim() && !photo) return; dismissKeyboard(); setAttachmentActive(false); setAttachmentExpanded(false); speech.current?.abort(); setRecentSearches(current => [{ image: 'tft', question: [query.trim() || 'Screenshot search', query.trim() || '截图搜索'] }, ...current].slice(0, 10)); setResult({ question: query.trim(), game: null }); }
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
  if (activeHistory) return <GameHistoryFeed history={activeHistory} chinese={chinese} onBack={() => setActiveHistory(null)} />;
  if (result) return <section className="hs-result"><button className="hs-back" onClick={() => setResult(null)}><ChevronLeft size={18}/>{c.back}</button><span className="hs-kicker">{c.result}</span><h2>{result.game ? result.game.question[l] : result.question || c.screenshot}</h2>{photo && <img className="hs-result-photo" src={photo} alt={c.screenshot}/>}<div className="hs-answer"><GameBuddyMark/><span>{c.demo}</span><p>{result.game?.answer ? result.game.answer[l] : c.generic}</p>{result.game?.url && <a href={result.game.url} target="_blank" rel="noreferrer">{c.source}<ArrowUpRight size={14}/></a>}</div></section>;
  const SearchFrame = beam && !v2 ? BorderBeam : 'div';
  const beamProps = beam && !v2 ? {size:'line',colorVariant:'mono',theme,duration:2.4,strength:0.4} : {};
  const art = (name, extension = 'svg') => `${import.meta.env.BASE_URL}assets/${name}.${extension}`;
  return <section className={`hs-home${v2 ? ' hs-home-v2' : ''}${keyboardOpen || attachmentActive ? ' hs-search-active' : ''}${keyboardOpen || (attachmentActive && attachmentExpanded) ? ' hs-is-typing' : ''}`}>
    {!composerOnly && <div className="hs-top"><div className="hs-brand"><img src={art(v2 ? 'home-v2-mark' : 'brand')} alt=""/><span>{v2 ? 'GameBUDDY' : 'GameBuddy'}</span></div><button className="hs-profile" aria-label={chinese ? '个人资料' : 'Your profile'} onClick={() => { dismissKeyboard(); onOpenAccount(); }}><img src={art('profile-dog', 'png')} alt=""/></button></div>}
    {v2 && <h1 className="hs-v2-greeting">{chinese ? '接下来玩什么？' : 'What shall we play?'}</h1>}
    <SearchFrame className="hs-search-beam" {...beamProps}>
    <form ref={composer} className="hs-search" onSubmit={submit}>
      {showRotatingHint && (v2 ? <FadingHint key={l} language={l} /> : <SplitTextHint key={l} language={l} />)}
      <textarea ref={searchInput} inputMode="none" onFocus={e => { setKeyboardHost(e.currentTarget.closest('.gb-home')); setKeyboardOpen(true); setAttachmentActive(false); }} onBlur={e => {
        if (e.relatedTarget?.closest('.hs-add')) {
          setAttachmentExpanded(true);
          setAttachmentActive(true);
        }
        setKeyboardOpen(false);
      }} rows="2" aria-label={searchHint} placeholder={composerOnly ? searchHint : ''} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {e.preventDefault(); submit(e);} }}/>
      {photo && <div className="hs-attachment"><img src={photo} alt={c.screenshot}/><button type="button" aria-label={c.remove} onClick={() => setPhoto(null)}><X size={15}/></button></div>}
      <div className="hs-search-actions"><button type="button" className="hs-add" title={c.screenshot} aria-label={c.screenshot} onPointerDown={() => {
        setAttachmentExpanded(keyboardOpen || attachmentExpanded || !!query.trim());
        setAttachmentActive(true);
      }} onClick={() => { setAttachmentActive(true); file.current.click(); }}><img src={art('add-circle')} alt=""/></button><div className="hs-right-actions"><button type="button" className="hs-mic" aria-label={listening ? c.listening : c.voice} aria-pressed={listening} onClick={voice}><img src={art('mic')} alt=""/></button>{query.trim() || photo ? <button className="hs-submit" aria-label={c.result} onPointerDown={e => e.preventDefault()}><img className="hs-send-circle" src={art('send-circle')} alt=""/><img className="hs-send-arrow" src={art('send-arrow')} alt=""/></button> : <button type="button" className="hs-voice" aria-label={listening ? c.listening : c.voice} aria-pressed={listening} onClick={voice}><img src={art('voice')} alt=""/></button>}</div></div>
      <input className="hs-file" type="file" accept="image/*" ref={file} onCancel={() => {
        if (!attachmentExpanded) setAttachmentActive(false);
      }} onChange={e => { const f=e.target.files?.[0]; if(f?.type.startsWith('image/')) setPhoto(URL.createObjectURL(f)); e.target.value=''; }}/>
    </form>
    </SearchFrame>
    {(notice || listening) && <p className="hs-notice" role="status">{listening ? c.listening : c.voiceHint}</p>}
    {v2 && <HistoryStrip label={chinese ? '搜索记录' : 'Search history'}>
      {gameHistory.map((history, index) => <button key={history.id} type="button" title={history.title[l]} aria-label={chinese ? `打开${history.title[l]}的聊天记录` : `Open chat history: ${history.title[l]}`} onClick={() => {
        dismissKeyboard();
        speech.current?.abort();
        setActiveHistory(history);
      }}><img src={`${import.meta.env.BASE_URL}assets/${history.image || `home-v2-game-${index + 1}.png`}`} alt="" /></button>)}
    </HistoryStrip>}
    {v2 && <section className="hs-v2-trending" aria-label={chinese ? '大家都在搜什么？' : 'What’s everyone searching?'}>
      <RotatingTrending items={rotatingTrendingGames} renderItem={(game, index) => (
          <button type="button" className="hs-v2-trending-row" onClick={() => {
            dismissKeyboard();
            speech.current?.abort();
            setResult({ game });
          }}>
            <span className="hs-v2-trending-index" aria-hidden="true">{index + 1}</span>
            <span className="hs-v2-trending-game">
              <img src={art(game.short === 'TFT' ? 'trending-tft' : game.image, game.imageExtension || 'png')} alt="" />
              <span className="hs-v2-trending-copy"><strong>{game.question[l]}</strong><span>{game.name[l]}</span></span>
            </span>
          </button>
      )} />
    </section>}
    {!composerOnly && !v2 && <>
    <section className="hs-history" aria-labelledby="my-searches-heading">
      <h2 id="my-searches-heading" className="hs-section-heading">{chinese ? '我的搜索' : 'My searches'}</h2>
      <div className="hs-history-strip">{recentSearches.map((item, index) => <button className="hs-history-card" key={`${item.image}-${index}`} title={item.question[l]} aria-label={item.question[l]} onClick={() => { speech.current?.abort(); setResult({question:item.question[l],game:null}); }}><img src={art(item.image, 'png')} alt=""/></button>)}</div>
    </section>
    <h2 className="hs-section-heading hs-trending-heading">{chinese ? '热搜' : 'Trending'}</h2>
    <div className="hs-questions" aria-label={chinese ? '游戏问题推荐' : 'Suggested game questions'}>{suggestions.map((g, slot)=><button key={slot} className={`hs-question${g.layout ? ` hs-question-${g.layout}` : ''}`} data-game={g.short} onClick={()=>{speech.current?.abort();setResult({game:g});}}><img className="hs-game-icon" src={art(g.image,g.imageExtension || 'png')} alt=""/>{g.layout !== 'compact' && <span className="hs-heat" title={chinese ? `演示数据：${g.heat.toLocaleString('zh-CN')} 人在问` : `Demo count: ${g.heat.toLocaleString('en-US')} people asking`} aria-label={chinese ? `演示热度：${g.heat} 人在问` : `Sample popularity: ${g.heat} people asking`}><img src={art('heat')} alt=""/><span>{formatHeat(g.heat, chinese)}</span></span>}<span className="hs-question-copy"><span className="hs-game-name">{g.name[l]}</span><strong>{g.question[l]}</strong></span></button>)}</div>
    </>}
    {keyboardOpen && keyboardHost && createPortal(<AndroidKeyboard chinese={chinese} onKey={typeKey} onDismiss={dismissKeyboard} onSearch={() => submit({ preventDefault() {} })}/>, keyboardHost)}
  </section>;
}
