import GameAssistPage from './GameAssistPage';
import MemoryPage from './MemoryPage';
import SettingsMenu from './SettingsMenu';
import AppUtilities from './AppUtilities';
import { appLanguages } from './appLanguages';
import { voiceOptions } from './voiceOptions';
import { useEffect, useRef, useState } from 'react';
import { Support, Guide, ChevronLeft, ChevronRight, Check, Settings, Bot, Captions, SlidersHorizontal, MessageSquare, RefreshCw, FileText, ShieldCheck, Mic, Play, Square, Brain, Search, HardDrive, KeyRound, Gamepad2, Activity } from './GBIcon';
import './AccountPage.css';

const defaults = { gameAssist: true, backgroundActivity: false, notifications: true, messages: true, mode: 'Medium', volume: 60, hud: true, audioChat: true, hudSize: 16, hudOpacity: 80, voice: voiceOptions[0][0] };
export default function AccountPage({ chinese, onBack, onSignOut, onShowGuide, appearance, setAppearance, language, setLanguage }) {
  const t = (en, zh) => chinese ? zh : en;
  const [settings, setSettings] = useState(() => {
    try {
      const saved = { ...defaults, ...JSON.parse(localStorage.getItem('gamebuddy-account-demo-v1') || '{}') };
      saved.mode = ({ Basic: 'Low', Standard: 'Medium', Pro: 'High' }[saved.mode]) || saved.mode;
      if (!['Low', 'Medium', 'High'].includes(saved.mode)) saved.mode = defaults.mode;
      return saved;
    }
    catch { return defaults; }
  });
  const [modeOpen, setModeOpen] = useState(false);
  const modePicker = useRef(null);
  const modeTrigger = useRef(null);
  const modeOptions = useRef([]);
  const modes = ['Low', 'Medium', 'High'];
  const modeLabel = mode => chinese ? ({ Low: '低', Medium: '中', High: '高' }[mode]) : mode;
  useEffect(() => {
    if (!modeOpen) return;
    modeOptions.current[modes.indexOf(settings.mode)]?.focus();
    const outside = e => { if (!modePicker.current?.contains(e.target)) setModeOpen(false); };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [modeOpen]);
  function closeMode() { setModeOpen(false); modeTrigger.current?.focus(); }
  const [detail, setDetail] = useState(null);
  const [notice, setNotice] = useState('');
  const [signedOut, setSignedOut] = useState(false);
  const audio = useRef(null);
  const [playing, setPlaying] = useState(null);
  useEffect(() => {
    audio.current?.pause();
    setPlaying(null);
    return () => { audio.current?.pause(); };
  }, [detail, settings.audioChat]);
  useEffect(() => { if (audio.current) audio.current.volume = settings.volume / 100; }, [settings.volume]);
  function playVoice(id) {
    audio.current?.pause();
    if (playing === id) { setPlaying(null); return; }
    const player = new Audio(`${import.meta.env.BASE_URL}assets/voice-previews/${id}.mp3`);
    audio.current = player;
    player.volume = settings.volume / 100;
    player.onended = () => { if (audio.current === player) setPlaying(null); };
    const failed = () => { if (audio.current === player) { setPlaying(null); setNotice(t('Could not play this preview. Try again.', '试听失败，请重试。')); } };
    player.onerror = failed;
    setNotice('');
    setPlaying(id);
    player.play().catch(failed);
  }
  const [feedback, setFeedback] = useState('');
  useEffect(() => { try { localStorage.setItem('gamebuddy-account-demo-v1', JSON.stringify(settings)); } catch {} }, [settings]);
  const update = (key, value) => setSettings(current => ({ ...current, [key]: value }));
  const links = {
    background: t('Background activity', '后台运行'),
    gameAssist: t('GameAssist', '游戏助手'),
    permissions: t('Permissions', '权限'),
    storage: t('Storage', '存储'),
    memory: t('Memory', '记忆'),
    audio: t('Audio', '音频'),
    subscription: t('Subscription', '订阅'),
    notifications: t('Notifications', '通知'),
    app: t('App settings', '应用设置'),
    appearance: t('Appearance', '外观'),
    language: t('Language', '语言'),
    hud: t('Text HUD', '文字 HUD'),
    feedback: t('Feedback', '意见反馈'),
    terms: t('Terms of Services', '服务条款'),
    privacy: t('Privacy Policy', '隐私政策')
  };
  const rowIcons = { gameAssist: Gamepad2, permissions: KeyRound, storage: HardDrive, memory: Brain, app: Settings, hud: SlidersHorizontal, feedback: Support, terms: FileText, privacy: ShieldCheck };
  const icon = Icon => Icon ? <Icon className="ac-leading-icon" aria-hidden="true" strokeWidth={1.7} /> : null;
  const row = (key, disabled = false) => <button className="ac-row" disabled={disabled} onClick={() => setDetail(key)} key={key}><span className="ac-row-label">{icon(rowIcons[key])}{links[key]}</span>{key === 'subscription' && <small className="ac-mode-status">Pro</small>}{key === 'gameAssist' && <small className="ac-mode-status">{settings.gameAssist ? t('On', '已开启') : t('Off', '已关闭')}</small>}<ChevronRight /></button>;
  return <section className="ac-page" aria-label={t('Account', '账号')}>
    {(detail || onBack) && <div className="ac-navigation"><button aria-label={t('Back', '返回')} onClick={() => { if (detail) { setDetail(['notifications', 'appearance', 'language', 'permissions', 'storage', 'background'].includes(detail) ? 'app' : null); setNotice(''); } else onBack?.(); }}><ChevronLeft /></button></div>}
    {signedOut ? <div className="ac-detail"><h1>{t('Signed out', '已退出登录')}</h1><p>{t('You’re signed out of this demo account.', '你已退出此演示账号。')}</p><button className="ac-primary" onClick={() => { setSignedOut(false); setDetail(null); }}>{t('Continue as Frankie', '以 Frankie 身份继续')}</button></div>
    : detail ? <div className="ac-detail"><h1>{detail === 'signout' ? t('Sign out?', '退出登录？') : links[detail]}</h1>
      {detail === 'signout' ? <><p>{t('Sign out of this demo account?', '是否退出此演示账号？')}</p><button className="ac-primary" onClick={() => onSignOut ? onSignOut() : setSignedOut(true)}>{t('Sign out', '退出登录')}</button><button className="ac-cancel" onClick={() => setDetail(null)}>{t('Cancel', '取消')}</button></>
      : detail === 'app' ? <div className="ac-group ac-settings-group">
        <div className="ac-row"><span className="ac-row-label">{links.appearance}</span><SettingsMenu label={links.appearance} value={appearance} options={[[ 'system',t('System','跟随系统') ],['light',t('Light','浅色')],['dark',t('Dark','深色')]]} onChange={setAppearance} /></div>
        <div className="ac-row"><span className="ac-row-label">{links.language}</span><SettingsMenu label={links.language} value={language} options={appLanguages} onChange={setLanguage} note={t('Demo translations: English and Simplified Chinese. Other selections preview in English.', '演示翻译支持英文和简体中文，其他选项暂以英文预览。')} /></div>
        {onShowGuide && <button className="ac-row" onClick={onShowGuide}><span className="ac-row-label">{icon(Guide)}{t('Welcome guide', '使用引导')}</span><ChevronRight/></button>}
        {row('notifications')}
        {row('permissions')}
        {row('storage')}
        <div className="ac-row"><span className="ac-row-label" id="ac-background-label">{icon(Activity)}{t('Allow background activity', '允许后台运行')}</span><button className="ac-switch" role="switch" aria-checked={settings.backgroundActivity} aria-labelledby="ac-background-label" onClick={() => update('backgroundActivity', !settings.backgroundActivity)}><span /></button></div>
      </div>
      : detail === 'notifications' ? <div className="ac-group">
        <div className="ac-row"><span className="ac-row-label" id="ac-push-label">{t('Push notifications', '推送通知')}</span><button className="ac-switch" role="switch" aria-checked={settings.notifications} aria-labelledby="ac-push-label" onClick={() => update('notifications', !settings.notifications)}><span /></button></div>
        <div className="ac-row"><span className="ac-row-label" id="ac-messages-label">{icon(MessageSquare)}{t('Messages', '消息')}</span><button className="ac-switch" role="switch" aria-checked={settings.messages} aria-labelledby="ac-messages-label" onClick={() => update('messages', !settings.messages)}><span /></button></div>
      </div>
      : ['permissions', 'storage'].includes(detail) ? <AppUtilities key={detail} page={detail} chinese={chinese} />
      : detail === 'gameAssist' ? <GameAssistPage chinese={chinese} enabled={settings.gameAssist} onEnabledChange={value => update('gameAssist', value)} />
      : detail === 'memory' ? <MemoryPage chinese={chinese} />
      : detail === 'audio' ? <>
        <div className="ac-group">
        <div className="ac-row"><span id="ac-audio-chat-label" className="ac-row-label">{t('Enable audio', '启用音频')}</span><button className="ac-switch" role="switch" aria-checked={settings.audioChat} aria-labelledby="ac-audio-chat-label" onClick={() => update('audioChat', !settings.audioChat)}><span /></button></div>
        </div>
        {settings.audioChat && <div className="ac-group ac-volume-card"><div className="ac-volume"><label htmlFor="ac-volume" className="ac-row-label">{t('Sound', '声音')}</label><div className="ac-volume-slider"><input className="ac-slider" id="ac-volume" style={{ '--volume-progress': `${Math.round(settings.volume / 10) * 10}%` }} type="range" min="0" max="10" step="1" value={Math.round(settings.volume / 10)} onChange={e => update('volume', Number(e.target.value) * 10)} /><output className="ac-volume-level" htmlFor="ac-volume">{Math.round(settings.volume / 10)}</output></div></div></div>}
        {settings.audioChat && <>
          <h2>{t('Voice', '音色')}</h2>
          <div className="ac-group" role="radiogroup" aria-label={t('Voice', '音色')}>
            {voiceOptions.map(v => <div className="ac-row ac-voice-row" key={v[0]}>
              <button className="ac-voice-choice" role="radio" aria-checked={settings.voice === v[0]} onClick={() => update('voice', v[0])}><span><strong>{v[chinese ? 2 : 1]}</strong><small>{v[chinese ? 4 : 3]}</small></span>{settings.voice === v[0] && <Check aria-hidden="true" />}</button>
              <button className="ac-voice-play" aria-label={`${playing === v[0] ? t('Stop', '停止') : t('Preview', '试听')} ${v[chinese ? 2 : 1]}`} onClick={() => playVoice(v[0])}>{playing === v[0] ? <Square /> : <Play />}</button>
            </div>)}
          </div>
        </>}
      </>
      : detail === 'hud' ? <>
        <div className="ac-group"><div className="ac-row"><span id="ac-hud-label" className="ac-row-label">{icon(Captions)}{t('Text HUD', '文字 HUD')}</span><button className="ac-switch" role="switch" aria-checked={settings.hud} aria-labelledby="ac-hud-label" onClick={() => update('hud', !settings.hud)}><span /></button></div></div>
        {settings.hud && <>
          <h2>{t('Preview', '预览')}</h2>
          <div className="ac-hud-preview"><span style={{fontSize:settings.hudSize + 'px', opacity:settings.hudOpacity / 100}}>{t('Your next move starts here.', '陪你一起玩。')}</span></div>
          <h2>{t('Appearance', '外观')}</h2>
          <div className="ac-group ac-hud-controls">
            <label htmlFor="ac-hud-size">{t('Text size', '文字大小')}<span>{settings.hudSize}px</span></label>
            <input id="ac-hud-size" type="range" min="12" max="24" value={settings.hudSize} onChange={e => update('hudSize', Number(e.target.value))} />
            <label htmlFor="ac-hud-opacity">{t('Opacity', '不透明度')}<span>{settings.hudOpacity}%</span></label>
            <input id="ac-hud-opacity" type="range" min="30" max="100" value={settings.hudOpacity} onChange={e => update('hudOpacity', Number(e.target.value))} />
          </div>
        </>}
      </>
      : detail === 'feedback' ? <form onSubmit={e => { e.preventDefault(); setNotice(t('Feedback saved for this demo session. Nothing was sent.', '反馈已保存在本次演示中，尚未发送。')); }}><p>{t('What could we do better?', '我们可以如何改进？')}</p><textarea required value={feedback} onChange={e => setFeedback(e.target.value)} aria-label={links.feedback} placeholder={t('Tell us what you think…', '告诉我们你的想法…')} /><button className="ac-primary">{t('Save feedback', '保存反馈')}</button></form>
      : <p>{t('This page is a preview. More options will be available when the service is connected.', '此页面为演示预览，接入服务后将提供更多选项。')}</p>}
      {notice && <p role="status">{notice}</p>}
    </div> : <>
      <div className="ac-identity"><img src={`${import.meta.env.BASE_URL}assets/profile-dog.png`} alt={t('Frankie’s profile picture', 'Frankie 的头像')} /><h1>Frankie</h1><p>ID. 1234567</p></div>
      <h2>{t('General', '通用')}</h2>
      <div className="ac-group">{['subscription', 'app'].map(key => row(key))}</div>
      <h2>GameBuddy</h2>
      <div className="ac-group">
        <div className="ac-mode"><span id="ac-mode-label" className="ac-row-label">{icon(Bot)}{t('Intelligence', '智能水平')}</span><div className="ac-mode-select" ref={modePicker} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setModeOpen(false); }}>
          <button ref={modeTrigger} className="ac-mode-trigger" aria-haspopup="menu" aria-expanded={modeOpen} aria-labelledby="ac-mode-label ac-mode-value" onClick={() => setModeOpen(!modeOpen)} onKeyDown={e => { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); setModeOpen(true); } }}><span id="ac-mode-value">{modeLabel(settings.mode)}</span></button>
          {modeOpen && <div className="ac-mode-menu" role="menu" aria-labelledby="ac-mode-label" onKeyDown={e => {
            const index = modeOptions.current.indexOf(document.activeElement);
            if (e.key === 'Escape') { e.preventDefault(); closeMode(); }
            if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) {
              e.preventDefault();
              const next = e.key === 'Home' ? 0 : e.key === 'End' ? 2 : (index + (e.key === 'ArrowDown' ? 1 : 2)) % 3;
              modeOptions.current[next]?.focus();
            }
          }}>{modes.map((mode, index) => <button key={mode} ref={el => { modeOptions.current[index] = el; }} role="menuitemradio" aria-checked={settings.mode === mode} onClick={() => { update('mode', mode); closeMode(); }}><span>{modeLabel(mode)}</span>{settings.mode === mode && <Check aria-hidden="true" />}</button>)}</div>}
        </div></div>
        <button className="ac-row" onClick={() => setDetail('hud')}><span className="ac-row-label">{icon(Captions)}{t('Text HUD', '文字 HUD')}</span><small className="ac-mode-status">{settings.hud ? t('On', '已开启') : t('Off', '已关闭')}</small><ChevronRight aria-hidden="true" /></button>
        <button className="ac-row" onClick={() => setDetail('audio')}><span className="ac-row-label">{icon(Mic)}{t('Audio', '音频')}</span><small className="ac-mode-status">{settings.audioChat ? t('On', '已开启') : t('Off', '已关闭')}</small><ChevronRight aria-hidden="true" /></button>
        {row('gameAssist')}
        {row('memory')}
      </div>
      <h2>{t('Support', '支持')}</h2>
      <div className="ac-group">{row('feedback')}<button className="ac-row" onClick={() => setNotice(t('Demo version 1.0.0 · Live update checks are not connected.', '演示版本 1.0.0 · 尚未接入在线更新。'))}><span className="ac-row-label">{icon(RefreshCw)}{t('Check for update', '检查更新')}</span><small>v1.0.0</small><ChevronRight /></button>{row('terms')}{row('privacy')}</div>
      {notice && <p className="ac-notice" role="status">{notice}</p>}
      <button className="ac-signout" onClick={() => setDetail('signout')}>{t('Sign out', '退出登录')}</button>
    </>}
  </section>;
}
