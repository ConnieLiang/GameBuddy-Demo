import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, X } from './GBIcon';

export default function TrendingSearches({ items, chinese, art, onBack, sideNavigation = false }) {
  const l = chinese ? 1 : 0;
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const heading = useRef(null);
  const scroll = useRef(null);
  const t = (en, zh) => chinese ? zh : en;
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, [selected]);
  useEffect(() => {
    const escape = event => { if (event.key === 'Escape') selected ? setSelected(null) : onBack(); };
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, [selected, onBack]);
  const image = game => art(game.short === 'TFT' ? 'trending-tft' : game.image, game.imageExtension || 'png');
  const adventure = game => ['CB', 'SAF'].includes(game.short);
  const visible = items.filter(game => filter === 'all' || (filter === 'adventure' ? adventure(game) : !adventure(game)));
  const open = game => { setSelected(game); };
  const card = (game, style, index) => <button key={game.id || game.short} className={`ts-card ${style}`} onClick={() => open(game)}>
    <img src={image(game)} alt="" loading="lazy"/>
    <span className="ts-card-copy"><span className="ts-game-name">{game.name[l]}</span><strong>{game.question[l]}</strong></span>
  </button>;
  return <section className="ts-page">
    <header className="ts-nav">{(selected || sideNavigation) && <button onClick={() => selected ? setSelected(null) : onBack()} aria-label={t('Back to trending searches', '返回热门搜索')}><ChevronLeft/></button>}<h1 ref={heading} tabIndex={-1}>{selected ? t('Search', '搜索') : t('Trending searches', '热门搜索')}</h1>{!sideNavigation && <button className="ts-close" onClick={onBack} aria-label={t('Close trending searches', '关闭热门搜索')}><X size={20}/></button>}</header>
    <div className="ts-scroll" ref={scroll} hidden={!!selected}>
      <div className="ts-intro"><p>{t('Find your next “what if?”', '发现下一个「试试看」')}</p></div>
      <div className="ts-filters" role="group" aria-label={t('Browse by category', '按分类浏览')}>{[['all','For you','为你推荐'],['strategy','Strategy','策略'],['adventure','Adventure','冒险']].map(([id,en,zh]) => <button key={id} aria-pressed={filter === id} onClick={() => setFilter(id)}>{t(en,zh)}</button>)}</div>
      {visible[0] && <div className="ts-feature"><span className="ts-eyebrow">{t('IN THE SPOTLIGHT', '精选话题')}</span>{card(visible[0], 'ts-hero', 0)}</div>}
      <h2>{t('Worth a try', '值得一试')}</h2>
      <div className="ts-grid">{visible.slice(1,5).map((game,index) => card(game, `ts-tile ts-tone-${index % 2}`, index))}</div>
      {visible.length > 5 && <><h2>{t('Keep exploring', '继续探索')}</h2><div className="ts-list">{visible.slice(5).map((game,index) => card(game, 'ts-compact', index))}</div></>}
    </div>
    {selected && <div className="ts-scroll ts-answer"><img src={image(selected)} alt=""/><span className="ts-game-name">{selected.name[l]}</span><h2>{selected.question[l]}</h2><p>{t('This preview shows how a search will look. Live answers will be connected in a later version.', '这里展示搜索后的交互效果。实时答案将在后续版本接入。')}</p>{selected.url && <a href={selected.url} target="_blank" rel="noreferrer">{t('Explore the game', '了解这款游戏')}</a>}</div>}
  </section>;
}
