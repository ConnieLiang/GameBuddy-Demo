import { useEffect, useState } from 'react';
import SettingsMenu from './SettingsMenu';
import './GameAssistPage.css';

const key = 'gb-gameassist-demo-v1';
const defaults = { size:'small', fade:false, transparency:60 };
// Fixed, sparse trails keep the preview calm and stable across settings changes.
const mosaicTrails = [
  [[6,0],[6,1],[7,2],[7,3],[7,4],[8,5],[8,6],[9,7],[9,8],[9,9]],
  [[11,3],[11,4],[12,5],[13,6],[14,6],[15,6],[16,6]],
  [[3,4],[3,5],[3,6],[2,7]],
  [[15,0],[16,1],[17,2],[18,3],[19,4]],
  [[3,8],[4,9],[5,9]],
];
const mosaicCells = Array.from({length:1152}, (_, i) => {
  const x=Math.round((i%48)*19/47), y=Math.round(Math.floor(i/48)*9/23);
  const distance=Math.min(...mosaicTrails.flat().map(([tx,ty])=>Math.abs(x-tx)+Math.abs(y-ty)));
  const variation=((x*17+y*31)%11)/10;
  return distance===0 ? 0.035+variation*0.11 : distance===1 ? 0.008+variation*0.018 : variation*0.006;
});
export default function GameAssistPage({chinese, enabled, onEnabledChange}) {
  const t=(en,zh)=>chinese?zh:en;
  const [settings,setSettings]=useState(()=>{
    try {
      const value={...defaults,...JSON.parse(localStorage.getItem(key)||'{}')};
      if(!['small','medium','large'].includes(value.size))value.size='small';
      value.transparency=Math.max(0,Math.min(90,Number(value.transparency)||0));
      return value;
    } catch {return defaults;}
  });
  const [idle,setIdle]=useState(false), [activity,setActivity]=useState(0);
  useEffect(()=>{try{localStorage.setItem(key,JSON.stringify(settings));}catch{}},[settings]);
  useEffect(()=>{
    setIdle(false);
    if(!enabled || !settings.fade)return;
    const timer=setTimeout(()=>setIdle(true),3000);
    return ()=>clearTimeout(timer);
  },[enabled,settings.size,settings.fade,activity]);
  const update=(field,value)=>setSettings(s=>({...s,[field]:value}));
  const wake=()=>{setIdle(false);setActivity(a=>a+1);};
  const faded=settings.fade&&idle;
  return <section className="ga-page">
    <p className="ga-intro">{t('Quickly receive guidance without leaving your game.','无需离开游戏，即可快速获取指导。')}</p>
    <div className="ac-group ga-enable"><div className="ac-row"><span id="ga-enable-label" className="ac-row-label">{t('Allow GameAssist','允许游戏助手')}</span><button className="ac-switch" role="switch" aria-labelledby="ga-enable-label" aria-checked={enabled} onClick={()=>onEnabledChange(!enabled)}><span/></button></div></div>
    {enabled && <>
    <div className="ga-preview">
      <span className="ga-preview-label">{t('Preview','预览')}</span>
      <div className="ga-preview-scene" aria-hidden="true">{mosaicCells.map((opacity, i) => <i key={i} style={{opacity}} />)}</div>
      <button className="ga-floating" style={{'--ga-size':({small:40,medium:48,large:56})[settings.size]+'px',opacity:faded?1-settings.transparency/100:1}} onClick={wake} onFocus={wake} aria-label={t('Activate GameAssist preview','激活游戏助手预览')}><img className="ga-floating-art" src={`${import.meta.env.BASE_URL}assets/gameassist-floating.svg`} alt="" draggable="false"/></button>
    </div>
    <div className="ac-group ga-settings">
      <div className="ac-row"><span className="ac-row-label">{t('Size','大小')}</span><SettingsMenu label={t('Size','大小')} value={settings.size} options={ [['small',t('Small','小')],['medium',t('Medium','中')],['large',t('Large','大')]] } onChange={value=>update('size',value)}/></div>
    </div>
    <div className="ac-group ga-settings">
      <div className="ac-row ga-fade-row"><div className="ga-label-copy"><span id="ga-fade-label" className="ac-row-label">{t('Fade when not in use','闲置时淡出')}</span><p id="ga-fade-description">{t('Fades after a few seconds so it’s easier to see your screen.','闲置几秒后淡出，让游戏画面更清晰。')}</p></div><button className="ac-switch" role="switch" aria-labelledby="ga-fade-label" aria-describedby="ga-fade-description" aria-checked={settings.fade} onClick={()=>update('fade',!settings.fade)}><span/></button></div>
      {settings.fade&&<div className="ga-transparency">
        <div><label htmlFor="ga-transparency">{t('Transparency when not in use','闲置时透明度')}</label></div>
        <input className="ac-slider" id="ga-transparency" type="range" min="0" max="90" step="5" value={settings.transparency} style={{'--volume-progress':settings.transparency/90*100+'%'}} onChange={e=>{update('transparency',Number(e.target.value));setIdle(true);}}/>
      </div>}
    </div>
    </>}
  </section>;
}
