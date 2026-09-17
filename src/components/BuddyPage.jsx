import { voiceOptions } from './voiceOptions';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowUp, Check, ChevronRight, Plus, Play, Square, X, Pencil, Trash2, UsersRound, Sparkles, AudioLines, Brain } from './GBIcon';
import './BuddyPage.css';

// Adapted from PersonaEditorScreen, BuddyCenterViewModel, and VoiceTypeManager
// in tapad/gamebuddy-rtc-fe, revision 9de5f1e. This demo uses local state, not RTC/AI.
export const initialBuddies = [
  { id:'gaming-wingman', name:['Wingman','电竞搭子'], description:['Easygoing, playful, on your side.','轻松、有趣，始终站在你这边。'], emoji:'🎮', voice:'zh_female_vv_uranus_bigtts', instructions:'', memories:[] },
  { id:'hardcore-commander', name:['Commander','铁血指挥官'], description:['Calm, direct, focused on your next move.','冷静、直接，专注你的下一步。'], emoji:'⚔️', voice:'zh_male_m191_uranus_bigtts', instructions:'', memories:[] },
];

const seeds = [
 {id:'m1', scope:'player', text:['I prefer short, practical answers.','我喜欢简短、实用的回答。'], status:'saved'},
 {id:'m2', scope:'shared', text:['Keep things relaxed when a match goes badly.','对局不顺时，希望交流轻松一点。'], status:'saved'},
 {id:'m3', scope:'player', text:['I want to learn more strategy games.','我想多了解一些策略游戏。'], status:'pending'},
];
export function loadBuddyState() {
 try { const data=JSON.parse(localStorage.getItem('gamebuddy-buddy-demo-v1')); if(data?.buddies?.length && data.buddies.some(b=>b.id===data.active)) return data; } catch {}
 return {buddies:initialBuddies.map(b=>({...b, memories:seeds.map(m=>({...m}))})),active:'gaming-wingman'};
}
export default function BuddyPage({chinese, theme}) {
 const l=chinese?1:0, t=(en,zh)=>chinese?zh:en;
 const [state,setState]=useState(loadBuddyState), [page,setPage]=useState('overview'), [picker,setPicker]=useState(false);
 const [newName,setNewName]=useState(''), [draft,setDraft]=useState(''), [preview,setPreview]=useState(false);
 const [scope,setScope]=useState('all'), [editing,setEditing]=useState(null), [editText,setEditText]=useState('');
 const [notice,setNotice]=useState(''), [playing,setPlaying]=useState(null), [removed,setRemoved]=useState(null);
 const audio=useRef(null), pickerInput=useRef(null);
 const buddy=state.buddies.find(b=>b.id===state.active)||state.buddies[0];
 const name=buddy.name[l];
 useEffect(()=>{try{localStorage.setItem('gamebuddy-buddy-demo-v1',JSON.stringify(state));}catch{}},[state]);
 useEffect(()=>()=>{audio.current?.pause();},[]);
 useEffect(()=>{audio.current?.pause();setPlaying(null);setNotice('');},[page,state.active]);
 useEffect(()=>{if(picker) pickerInput.current?.focus();},[picker]);
 function update(patch) {setState(s=>({...s,buddies:s.buddies.map(b=>b.id===s.active?{...b,...patch}:b)}));}
 function go(destination) {setPage(destination);setRemoved(null);setEditing(null);setDraft(buddy.instructions);setPreview(false);}
 function playVoice(id) {
  audio.current?.pause(); if(playing===id){setPlaying(null);return;}
  const player=new Audio(`${import.meta.env.BASE_URL}assets/voice-previews/${id}.mp3`);audio.current=player;
  player.onended=()=>setPlaying(null);player.onerror=()=>{setPlaying(null);setNotice(t('Could not play this preview. Try again.','试听失败，请重试。'));};
  setPlaying(id);player.play().catch(()=>{setPlaying(null);setNotice(t('Could not play this preview. Try again.','试听失败，请重试。'));});
 }
 function create(e) {e.preventDefault();if(!newName.trim())return;const id=crypto.randomUUID();setState(s=>({...s,active:id,buddies:[...s.buddies,{...initialBuddies[0],id,name:[newName.trim(),newName.trim()],memories:[],custom:true}]}));setNewName('');setPicker(false);setPage('personality');setDraft('');setPreview(false);}
 function memoryAction(id,action) {
  if(action==='forget'){const item=buddy.memories.find(m=>m.id===id);setRemoved(item);update({memories:buddy.memories.filter(m=>m.id!==id)});return;}
  update({memories:buddy.memories.map(m=>m.id===id?{...m,status:'saved'}:m)});
 }
 const memories=buddy.memories.filter(m=>scope==='all'||m.scope===scope);
 const selectedVoice=voiceOptions.find(v=>v[0]===buddy.voice)||voiceOptions[0];
 return <section className={`bp-page${page==='overview' ? ' bp-overview' : ''}`}>
  <header className="bp-header">
   {page!=='overview' && <button className="bp-icon-button" aria-label={t('Back to Buddy','返回 Buddy')} onClick={()=>go('overview')}><ArrowLeft/></button>}
   {page!=='overview' && <h1>{page==='personality'?t('Personality','性格'):page==='voice'?t('Voice','声音'):t('Memories','记忆')}</h1>}
   {page==='overview' && <><button className="hs-voice bp-header-action" onClick={()=>setPicker(!picker)} aria-expanded={picker} aria-label={t('Buddy types','Buddy 类型')} title={t('Buddy types','Buddy 类型')}><UsersRound aria-hidden="true"/></button><button className="hs-voice bp-header-action" onClick={()=>{setPicker(false);go('memories');}} aria-label={t('Memory','记忆')} title={t('Memory','记忆')}><Brain aria-hidden="true"/></button></>}
  </header>
  {picker && <div className="bp-picker">
   <div className="bp-row"><h2>{t('Choose your Buddy','选择你的 Buddy')}</h2><button className="bp-icon-button" onClick={()=>setPicker(false)} aria-label={t('Close','关闭')}><X/></button></div>
   {state.buddies.map(b=><button className="bp-choice" key={b.id} onClick={()=>{setState(s=>({...s,active:b.id}));setPicker(false);setPage('overview');}}><span>{b.emoji}</span><span>{b.name[l]}</span>{b.id===buddy.id&&<Check/>}</button>)}
   <form className="bp-create" onSubmit={create}><input ref={pickerInput} aria-label={t('New Buddy name','新 Buddy 的名字')} placeholder={t('Name a new Buddy…','给新 Buddy 起个名字…')} maxLength={24} value={newName} onChange={e=>setNewName(e.target.value)}/><button className="bp-icon-button" disabled={!newName.trim()} aria-label={t('Create Buddy','创建 Buddy')}><Plus/></button></form>
  </div>}
  {page==='overview' && <div className="bp-search-center bp-wip"><h2>{t('Buddy is still leveling up','Buddy 正在升级中')}</h2><p>{t('This page is a work in progress. BRB.','页面还在打磨，稍后回城。')}</p></div>}
  {page==='personality' && <>
   <p className="bp-intro">{t('Tell your Buddy how you like to play and talk.','告诉 Buddy，你喜欢怎样玩、怎样聊。')}</p>
   <div className="bp-card"><span className="bp-eyebrow">{t('START WITH A STYLE','从一种风格开始')}</span><div className="bp-templates">{initialBuddies.map(b=><button key={b.id} onClick={()=>{setDraft(b.description[l]);setPreview(false);}}><span>{b.emoji}</span>{b.name[l]}</button>)}</div></div>
   <form onSubmit={e=>{e.preventDefault();setPreview(true);}} className="bp-shape-form">
    <label htmlFor="buddy-instructions">{t('Make it personal','你的偏好')}</label>
    <textarea id="buddy-instructions" rows={5} maxLength={1500} value={draft} onChange={e=>{setDraft(e.target.value);setPreview(false);}} placeholder={t('Be encouraging, keep advice short, and let me figure things out first…','多鼓励我，建议简短一点，先让我自己试试…')}/>
    <button className="bp-primary" disabled={!draft.trim()}>{t('Preview changes','预览修改')}<ArrowUp/></button>
   </form>
   {preview && <div className="bp-card bp-preview"><span className="bp-eyebrow">{t('READY TO SAVE','待保存')}</span><p>{draft}</p><small>{t('Saved as your instructions. AI personality generation is not connected in this demo.','将保存为你的偏好指令。演示版尚未接入 AI 性格生成。')}</small><button className="bp-primary" onClick={()=>{update({instructions:draft.trim()});setPreview(false);setNotice(t('Your preferences are saved.','偏好已保存。'));}}>{t('Save preferences','保存偏好')}<Check/></button></div>}
  </>}
  {page==='voice' && <><p className="bp-intro">{t('Find a voice that feels right.','选一个听着舒服的声音。')}</p><p className="bp-caption">{t('Original Chinese voice previews from the app.','来自原应用的中文音色试听。')}</p><div className="bp-voices" role="radiogroup" aria-label={t('Buddy voice','Buddy 音色')}>{voiceOptions.map(v=><div className={`bp-voice ${buddy.voice===v[0]?'is-selected':''}`} key={v[0]}><button role="radio" aria-checked={buddy.voice===v[0]} className="bp-voice-select" onClick={()=>update({voice:v[0]})}><span className="bp-radio">{buddy.voice===v[0]&&<Check/>}</span><span><strong>{v[chinese?2:1]}</strong><small>{v[chinese?4:3]}</small></span></button><button className="bp-play" aria-label={`${playing===v[0]?t('Stop','停止'):t('Preview','试听')} ${v[chinese?2:1]}`} onClick={()=>playVoice(v[0])}>{playing===v[0]?<Square/>:<Play/>}</button></div>)}</div></>}
  {page==='memories' && <>
   <p className="bp-intro">{t('What your Buddy knows. Always in your hands.','Buddy 记住的事，由你决定。')}</p>
   <div className="bp-filters" aria-label={t('Memory category','记忆分类')}>{[['all','All','全部'],['shared','Together','我们的记忆'],['player','About you','关于我']].map(([id,en,zh])=><button key={id} aria-pressed={scope===id} onClick={()=>setScope(id)}>{t(en,zh)}</button>)}</div>
   <span className="bp-caption">{t('Sample memories for this demo','以下为演示记忆')}</span>
   {memories.length===0&&<div className="bp-card bp-empty">{t('Nothing here yet. Your memories will appear here.','这里还没有记忆。新的记忆会出现在这里。')}</div>}
   {memories.map(m=><article className="bp-card bp-memory" key={m.id}><div className="bp-row"><span className="bp-eyebrow">{m.scope==='player'?t('ABOUT YOU','关于我'):t('TOGETHER','我们的记忆')}</span><span className={m.status==='pending'?'bp-pending-label':'bp-caption'}>{m.status==='pending'?t('Confirm?','待确认'):t('Remembered','已记住')}</span></div>
    {editing===m.id?<form onSubmit={e=>{e.preventDefault();update({memories:buddy.memories.map(item=>item.id===m.id?{...item,text:[editText.trim(),editText.trim()],status:'saved'}:item)});setEditing(null);}}><textarea aria-label={t('Edit memory','编辑记忆')} value={editText} onChange={e=>setEditText(e.target.value)} rows={3}/><div className="bp-actions"><button className="bp-text-button" disabled={!editText.trim()}>{t('Save','保存')}</button><button type="button" className="bp-text-button" onClick={()=>setEditing(null)}>{t('Cancel','取消')}</button></div></form>:<><p>{m.text[l]}</p><div className="bp-actions">{m.status==='pending'&&<button className="bp-text-button" onClick={()=>memoryAction(m.id,'confirm')}><Check/>{t('Confirm','确认')}</button>}<button className="bp-text-button" onClick={()=>{setEditing(m.id);setEditText(m.text[l]);}}><Pencil/>{t('Edit','编辑')}</button><button className="bp-text-button" onClick={()=>memoryAction(m.id,'forget')}><Trash2/>{m.status==='pending'?t('Dismiss','忽略'):t('Forget','忘记')}</button></div></>}
   </article>)}
   {removed&&<div className="bp-undo" role="status">{t('Memory removed','记忆已移除')}<button onClick={()=>{update({memories:[...buddy.memories,removed]});setRemoved(null);}}>{t('Undo','撤销')}</button></div>}
  </>}
  {notice&&<p className="bp-notice" role="status">{notice}</p>}
 </section>;
}
