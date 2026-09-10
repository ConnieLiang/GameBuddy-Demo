import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Heart, RotateCw, UsersRound, X } from 'lucide-react';
import './SquadPage.css';

export const players = [
 {id:'che-v1',name:['Che','阿澈'],role:['Support','辅助'],style:['Steady protector','稳健守护型'],body:['Protects the backline before engaging. Quiet, with clear calls when it matters.','先看后排再开团；话不多，关键时刻报点。'],tags:[['Protects teammates','保护后排'],['Clear calls','关键报点']],offer:['Support and backline protection','本次愿意辅助、保护后排'],need:['A marksman who discusses picks','愿意沟通选人的射手'],unknown:['Voice availability needs confirmation','语音安排待确认']},
 {id:'yue-v1',name:['Yue','阿岳'],role:['Jungle','打野'],style:['Sets the pace','主动带节奏型'],body:['Likes early rotations and discussing the next objective. Happy to explain a play after the match.','喜欢主动游走，提前沟通下个目标，愿意赛后交流思路。'],tags:[['Proactive','主动游走'],['Shares ideas','交流思路']],offer:['Jungle and objective calls','本次愿意打野、沟通资源目标'],need:['Teammates willing to coordinate rotations','愿意配合游走的队友'],unknown:['Playing time needs confirmation','共同游玩时间待确认']},
 {id:'ran-v1',name:['Ran','阿燃'],role:['Clash lane','对抗路'],style:['Relaxed, with a goal','随和目标型'],body:['Enjoys improving together without blaming teammates for mistakes.','希望一起进步，接受失误，不因输赢责怪队友。'],tags:[['Patient','有耐心'],['Learning together','一起进步']],offer:['Clash lane and relaxed communication','本次愿意对抗路、轻松沟通'],need:['Someone happy to learn together','愿意一起练习的队友'],unknown:['Rank compatibility needs confirmation','段位兼容性待确认']},
];
const storageKey='gb-squad-discovery-demo-v1';
function load(){try{return JSON.parse(localStorage.getItem(storageKey))||{};}catch{return {};}}
export default function SquadDiscovery({chinese, game, filters, onProfile, onRules, onInterest}) {
 const t=(en,zh)=>chinese?zh:en, l=chinese?1:0;
 const [decisions,setDecisions]=useState(load),[back,setBack]=useState(false),[view,setView]=useState('discover'),[undo,setUndo]=useState(null),[notice,setNotice]=useState('');
 const [drag,setDrag]=useState(0),[dragging,setDragging]=useState(false),[leaving,setLeaving]=useState(false);
 const gesture=useRef(null), suppressClick=useRef(false), timer=useRef(null), busy=useRef(false);
 useEffect(()=>()=>clearTimeout(timer.current),[]);
 const eligible=game==='wzry'?players.filter(p=>!filters.role || p.role[0]===filters.role).filter(p=>!filters.v10 || p.id==='che-v1'):[];
 const player=eligible.find(p=>!decisions[p.id]);
 const save=next=>{try{localStorage.setItem(storageKey,JSON.stringify(next));setDecisions(next);return true;}catch{setNotice(t('Could not save. Please try again.','保存失败，请重试。'));return false;}};
 function decide(action){if(!player)return;if(save({...decisions,[player.id]:action})){if(action==='interest')onInterest(player.id);setUndo(action==='skip'?player.id:null);setBack(false);setNotice(action==='interest'?t('Interest saved in this demo. A mutual match needs their response.','已在演示中记录兴趣，互选还需对方回应。'):'');}}
 function swipe(action){
  if(busy.current||!player)return;
  busy.current=true;setDragging(false);setLeaving(true);
  setDrag((action==='interest'?1:-1)*window.innerWidth);
  timer.current=setTimeout(()=>{decide(action);setDrag(0);setLeaving(false);busy.current=false;},window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:260);
 }
 function startDrag(e){
  if(busy.current||e.button!==0||e.target.closest('.bp-icon-button, [data-no-swipe]'))return;
  suppressClick.current=false;
  gesture.current={id:e.pointerId,x:e.clientX,y:e.clientY,width:e.currentTarget.offsetWidth,axis:null};
 }
 function moveDrag(e){
  const g=gesture.current;if(!g||g.id!==e.pointerId)return;
  const dx=e.clientX-g.x,dy=e.clientY-g.y;
  if(!g.axis&&Math.hypot(dx,dy)>8){g.axis=Math.abs(dx)>Math.abs(dy)?'x':'y';suppressClick.current=true;}
  if(g.axis==='x'){e.currentTarget.setPointerCapture(e.pointerId);setDragging(true);setDrag(dx);}
 }
 function endDrag(e,cancel=false){
  const g=gesture.current;if(!g)return;gesture.current=null;setDragging(false);
  const dx=e.clientX-g.x;
  if(!cancel&&g.axis==='x'&&Math.abs(dx)>g.width*0.25)swipe(dx>0?'interest':'skip');else setDrag(0);
 }
 return <section className="bp-page sq-page">

  {view==='discover' ? player ? <>
   <div className="sq-deck">
   {eligible.filter(p=>!decisions[p.id]).slice(1,3).reverse().map((p,i)=><div key={p.id} className="sq-stack" aria-hidden="true" style={{transform:`translateY(${(2-i)*7}px) scale(${0.96-i*0.015})`}}/>)}
   <article className={`sq-card sq-swipe-card${dragging?' is-dragging':''}${leaving?' is-leaving':''}`} style={{transform:`translateX(${drag}px) rotate(${Math.max(-25,Math.min(25,drag/18))}deg)`}} onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={e=>endDrag(e,true)} onClickCapture={e=>{if(suppressClick.current||busy.current){e.preventDefault();e.stopPropagation();suppressClick.current=false;}}}>
    <span className={`sq-stamp ${drag>0?'sq-yes':'sq-no'}`} style={{opacity:Math.min(1,Math.abs(drag)/90)}} aria-hidden="true">{drag>0?t('LET’S PLAY','想一起玩'):t('PASS','跳过')}</span>
    <div className="sq-person"><div className="sq-avatar">{player.name[l].slice(0,1)}</div><div><h2>{player.name[l]}</h2><p>{player.role[l]}</p></div><button className="bp-icon-button" aria-label={t('Flip player card','翻转玩家卡片')} aria-pressed={back} onClick={()=>setBack(!back)}><RotateCw/></button></div>
    <button className="sq-face" onClick={()=>setBack(!back)} aria-label={back?t('Show offers and needs','查看提供与需要'):t('Show play style','查看游戏风格')}>
     {back?<><span className="sq-eyebrow">{t('PLAY STYLE','游戏风格')}</span><h3>{player.style[l]}</h3><p>{player.body[l]}</p><div className="sq-tags">{player.tags.map(tag=><span key={tag[0]}>{tag[l]}</span>)}</div><small>{t('Illustrative profile · not verified game data','示例画像 · 非已核验游戏数据')}</small></>:<><h3>{player.style[l]}</h3>{player.id==='che-v1'&&<div className="sq-tags"><span>V10</span><span>{t('Support · 68% / 50 games','辅助位 · 近50局胜率68%')}</span><span>{t('20:00–22:00 · Ranked','20:00–22:00 · 认真上分')}</span></div>}<div className="sq-item"><span>{t('Offers','愿意提供')}</span><p>{player.offer[l]}</p></div><div className="sq-item"><span>{t('Looking for','希望找到')}</span><p>{player.need[l]}</p></div><p className="sq-unknown">{player.unknown[l]}</p>{player.id==='che-v1'&&<><p className="sq-match">{t('Compatible roles: support ↔ marksman','位置互补：辅助 ↔ 射手')}</p><small>{t('Example intent. Skin ownership and recipient allowance still need confirmation.','示例意图。指定皮肤持有与体验方余量待确认。')}</small></>}</>}
     <span className="sq-flip-hint">{t('Tap to flip','点击翻面')}</span>
    </button>
    <div className="sq-card-links" data-no-swipe><button className="bp-text-button" onClick={()=>onProfile(player)}>{t('Full profile','完整画像')} ›</button>{player.id==='che-v1'&&<button className="bp-text-button" onClick={onRules}>V10 ›</button>}</div>
   </article></div>
   <div className="sq-actions"><button className="sq-skip" disabled={leaving} aria-label={t('Skip','跳过')} title={t('Skip','跳过')} onClick={()=>swipe('skip')}><X/></button><button className="bp-primary" disabled={leaving} aria-label={t('Want to play','想一起玩')} title={t('Want to play','想一起玩')} onClick={()=>swipe('interest')}><Heart/></button></div>
  </>:<div className="sq-empty"><UsersRound/><h2>{eligible.length?t('You’ve seen this round','这轮队友已经看完了'):t('No players for these filters','当前条件下暂无玩家')}</h2><p>{t('Check back for new players. Your choices are saved.','之后再来看看新队友，你的选择已保存。')}</p><button className="bp-text-button" onClick={()=>{setDecisions(load());setNotice(t('No new demo players yet.','暂时没有新的演示玩家。'));}}>{t('Refresh','刷新')}</button></div>:<div className="sq-interests">{players.filter(p=>decisions[p.id]==='interest').length===0?<p className="sq-empty">{t('Players you want to play with will appear here.','想一起玩的玩家会显示在这里。')}</p>:players.filter(p=>decisions[p.id]==='interest').map(p=><article className="sq-card" key={p.id}><h2>{p.name[l]}</h2><p>{p.role[l]} · {p.style[l]}</p><small>{t('Interest recorded · awaiting a response','已记录兴趣 · 等待回应')}</small></article>)}</div>}
  {view==='discover'&&!leaving&&undo&&<button className="bp-text-button" onClick={()=>{const next={...decisions};delete next[undo];if(save(next)){setUndo(null);setBack(false);}}}>{t('Undo last skip','撤销上次跳过')}</button>}
  {notice&&<p className="sq-notice" role="status">{notice}</p>}
 </section>;
}
