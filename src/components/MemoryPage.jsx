import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check, Pencil, Trash2, MessageSquareOff, RotateCcw } from 'lucide-react';
import './MemoryPage.css';

// Port of PersonaEditorScreen's memory center and BuddyMemoryCenter lifecycle/actions.
// Sample records only; no production memory service is called.
const sample = [
 {id:'support',scope:'shared',space:'buddy',state:'saved',title:['How we talk','我们的交流方式'],text:['Keep advice short during a match; explain more afterward.','对局中建议简短，结束后再详细解释。'],use:['Keep live guidance brief.','对局指导保持简短。'],evidence:['Sample: an explicit preference from a conversation.','示例：来自一次对话中明确表达的偏好。']},
 {id:'goal',scope:'shared',space:'buddy-game',state:'saved',title:['Our next goal','我们接下来的目标'],text:['Practice making a plan before spending gold in TFT.','练习在云顶之弈花金币前先确定计划。'],use:['Offer a planning reminder when relevant.','在适当时机提醒先做计划。'],evidence:['Sample: a goal you agreed to work on.','示例：你确认过的练习目标。']},
 {id:'nickname',scope:'shared',space:'buddy',state:'pending',title:['What to call you','如何称呼你'],text:['You may prefer to be called Frankie.','你可能更喜欢被称为 Frankie。'],use:['Use this name after you confirm it.','确认后使用这个称呼。'],evidence:['Sample: heard in voice chat; the meaning needs confirmation.','示例：来自语音交流，具体含义需要确认。']},
 {id:'timing',scope:'shared',space:'buddy-game',state:'learning',title:['When to offer advice','何时给出建议'],text:['You seem to prefer advice between rounds.','你似乎更喜欢在回合之间获得建议。'],use:['Adapt the timing of guidance if this is confirmed.','确认后调整建议时机。'],evidence:['Sample: a single observation, not enough to establish a preference.','示例：仅有一次观察，还不足以确定偏好。']},
 {id:'answers',scope:'player',space:'global',state:'saved',title:['Your preferences','你的偏好'],text:['Give practical examples when explaining a strategy.','解释策略时给出实用的例子。'],use:['Include examples in search answers.','在搜索回答中提供例子。'],evidence:['Sample: explicitly requested by you.','示例：由你明确提出。']},
 {id:'tft',scope:'player',space:'game',state:'saved',title:['Your play style','你的玩法习惯'],text:['You are practicing flexible team building in TFT.','你正在练习云顶之弈的灵活组队。'],use:['Explain alternative paths instead of one fixed lineup.','解释可选路线，而非只推荐固定阵容。'],evidence:['Sample: a preference you confirmed.','示例：你确认过的偏好。']},
 {id:'pace',scope:'player',space:'global',state:'conflict',title:['How much detail','需要多少细节'],text:['Some conversations suggest short answers; others suggest detailed explanations.','有些对话表明你喜欢简短回答，另一些则偏向详细解释。'],use:['Ask for clarification before applying this preference.','应用偏好之前先询问。'],evidence:['Sample: conflicting preferences across conversations.','示例：不同对话中的偏好存在冲突。']},
 {id:'practice',scope:'player',space:'game',state:'more',title:['Your practice focus','你的练习重点'],text:['You mentioned wanting to improve, but not which skill.','你提到想提升，但还没有说明具体技能。'],use:['Ask what you want to practice next.','询问接下来想练习什么。'],evidence:['Sample: an incomplete goal.','示例：尚不完整的目标。']},
];
const storageKey = 'gb-memory-center-demo-v1';
export default function MemoryPage({chinese}) {
 const l=chinese?1:0, t=(en,zh)=>chinese?zh:en;
 const [items,setItems]=useState(()=>{try{const saved=JSON.parse(localStorage.getItem(storageKey));if(Array.isArray(saved))return saved;}catch{}return sample;});
 const [scope,setScope]=useState('shared'), [space,setSpace]=useState('all'), [learning,setLearning]=useState(false);
 const [action,setAction]=useState(null), [draft,setDraft]=useState(''), [undo,setUndo]=useState(null), [notice,setNotice]=useState('');
 const editor=useRef(null), returnFocus=useRef(null);
 useEffect(()=>{try{localStorage.setItem(storageKey,JSON.stringify(items));}catch{}},[items]);
 useEffect(()=>{if(action)editor.current?.focus();},[action]);
 const spaces=[['all','All','全部'],['global','Across games','跨游戏'],['buddy','With GameBuddy','与 GameBuddy'],['game','TFT','云顶之弈'],['buddy-game','Together in TFT','一起玩云顶之弈']];
 const labels={confirm:t('Confirm','确认'),reject:t('Not right','不是这样'),correct:t('Correct','纠正'),edit:t('Edit','编辑'),forget:t('Forget','忘记'),mute:t('Don’t mention again','以后不要再提')};
 const statuses={saved:t('Remembered','已记住'),pending:t('Needs confirmation','待确认'),learning:t('Learning','正在了解'),conflict:t('Conflicting information','存在冲突'),more:t('Needs more information','需要更多信息'),muted:t('Won’t mention','不再提及'),retired:t('Stopped using','已停止使用')};
 const visible=items.filter(m=>m.scope===scope&&(space==='all'||m.space===space));
 const pending=visible.filter(m=>m.state==='pending'), forming=visible.filter(m=>['learning','conflict','more'].includes(m.state)), saved=visible.filter(m=>m.state==='saved'), inactive=visible.filter(m=>['muted','retired'].includes(m.state));
 function open(m,type,e){returnFocus.current=e.currentTarget;setAction({m,type});setDraft(type==='edit'?m.text[l]:'');}
 function close(){setAction(null);requestAnimationFrame(()=>returnFocus.current?.focus());}
 function apply(e){
   e.preventDefault();const {m,type}=action;setUndo(items);
   setItems(current=>{
     if(['forget','reject'].includes(type))return current.filter(x=>x.id!==m.id);
     if(type==='confirm')return current.map(x=>x.id===m.id?{...x,state:'saved'}:x);
     if(type==='mute')return current.map(x=>x.id===m.id?{...x,state:'muted'}:x);
     const next=current.map(x=>x.id===m.id?{...x,state:'retired'}:x);
     if(draft.trim())next.unshift({...m,id:crypto.randomUUID(),text:[draft.trim(),draft.trim()],state:type==='edit'?'saved':'pending',evidence:[type==='edit'?'Edited by you in this demo.':'Correction provided by you; awaiting confirmation.',type==='edit'?'你在演示中编辑的内容。':'你提供的纠正，等待确认。']});
     return next;
   });
   setNotice(type==='correct'&&!draft.trim()?t('Original memory stopped. Add the correct understanding when you’re ready.','已停用原记忆，你可以稍后补充正确的理解。'):t('Memory updated in this demo.','演示记忆已更新。'));
   close();
 }
 function card(m){
   const active=m.state==='saved', candidate=m.state==='pending';
   return <article className="mm-card" key={m.id}>
     <div className="mm-card-top"><strong>{m.title[l]}</strong><span>{statuses[m.state]}</span></div>
     <small>{spaces.find(s=>s[0]===m.space)?.[l+1]}</small>
     <p>{m.text[l]}</p>
     <p className="mm-use">{t('Future use: ','未来用途：')}{m.use[l]}</p>
     <details><summary>{t('View evidence','查看依据')}</summary><p>{m.evidence[l]}</p></details>
     {(active||candidate)&&<div className="mm-actions">{(active?['correct','edit','forget','mute']:['confirm','reject']).map(type=><button key={type} onClick={e=>open(m,type,e)}>{type==='confirm'?<Check/>:type==='edit'?<Pencil/>:type==='forget'?<Trash2/>:type==='mute'?<MessageSquareOff/>:null}{labels[type]}</button>)}</div>}
   </article>;
 }
 if(action)return <section className="mm-editor" ref={editor} tabIndex={-1} onKeyDown={e=>{if(e.key==='Escape')close();}}>
   <h3>{labels[action.type]}</h3><p>{action.m.text[l]}</p>
   <p className="mm-note">{action.type==='mute'?t('This memory will stop being used. The boundary is kept in this demo.','将停止使用这条记忆，并在演示中保留这个边界。'):action.type==='correct'?t('Stop using the original. Any correction is saved for confirmation.','停用原记忆，纠正内容保存后待确认。'):action.type==='edit'?t('Keep the original inactive and save your edited version.','停用原记忆并保存编辑后的版本。'):t('Only this item will change. You can undo afterward.','仅修改这一条，操作后可以撤销。')}</p>
   <form onSubmit={apply}>{['edit','correct'].includes(action.type)&&<textarea aria-label={t('Correct understanding','正确理解')} value={draft} maxLength={1500} rows={5} onChange={e=>setDraft(e.target.value)} placeholder={t('What should GameBuddy remember?','GameBuddy 应该记住什么？')} required={action.type==='edit'}/>}
     <button className="ac-primary" disabled={action.type==='edit'&&!draft.trim()}>{labels[action.type]}</button>
     <button type="button" className="ac-cancel" onClick={close}>{t('Cancel','取消')}</button>
   </form>
 </section>;
 return <section className="mm-page">
   <p className="mm-note">{t('What GameBuddy remembers, and what it is still learning. Sample data · changes stay on this device.','查看 GameBuddy 记住的事和仍在了解的内容。示例数据 · 修改保存在本机。')}</p>
   <div className="mm-tabs" role="group" aria-label={t('Memory category','记忆分类')}>{[['shared','Our memories','我们的记忆'],['player','About you','关于我']].map(([id,en,zh])=><button key={id} aria-pressed={scope===id} onClick={()=>{setScope(id);setSpace('all');setLearning(false);}}>{t(en,zh)}</button>)}</div>
   <div className="mm-spaces" role="group" aria-label={t('Memory space','记忆空间')}>{spaces.filter(s=>s[0]==='all'||items.some(m=>m.scope===scope&&m.space===s[0])).map(([id,en,zh])=><button key={id} aria-pressed={space===id} onClick={()=>setSpace(id)}>{t(en,zh)}</button>)}</div>
   {undo&&<div className="mm-undo" role="status"><span>{notice}</span><button onClick={()=>{setItems(undo);setUndo(null);setNotice('');}}><RotateCcw/>{t('Undo','撤销')}</button></div>}
   {pending.length>0&&<><h3>{t('Needs your confirmation','待你确认')} · {pending.length}</h3><p className="mm-note">{t('These are not treated as facts until you confirm them.','确认之前，这些内容不会作为长期事实使用。')}</p>{pending.map(card)}</>}
   {forming.length>0&&<><button className="mm-learning" aria-expanded={learning} onClick={()=>setLearning(!learning)}><span>{t('Still learning','正在了解')} · {forming.length}</span><ChevronDown style={{transform:learning?'rotate(180deg)':undefined}}/></button>{learning&&<><p className="mm-note">{t('Still gathering evidence. These are not confirmed memories.','仍在积累证据，这些不是已确认的记忆。')}</p>{forming.map(card)}</>}</>}
   <h3>{t('Remembered','已记住')} · {saved.length}</h3>
   {saved.length?saved.map(card):<div className="mm-empty">{t('No saved memories here yet. Tell GameBuddy what matters to you.','这里还没有已保存的记忆。告诉 GameBuddy 你在意的事吧。')}</div>}
   {inactive.length>0&&<details className="mm-inactive"><summary>{t('Not used','不再使用')} · {inactive.length}</summary>{inactive.map(card)}</details>}
 </section>;
}
