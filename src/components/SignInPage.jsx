import { useEffect, useRef, useState } from 'react';
import './SignInPage.css';
import designTokens from '../../design.tokens.json';
const privacyUrl = 'https://game-copilot-service.tapapis.cn/doc/privacy-policy';
const agreementType = designTokens.typography.app.body.md.$value;
export default function SignInPage({ theme, chinese, onContinue, entranceReady = true }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const privacyTrigger = useRef(null);
  const closePrivacyRef = useRef(null);
  const openPrivacy = event => {event.preventDefault(); privacyTrigger.current = event.currentTarget; setPrivacyOpen(true);};
  const closePrivacy = () => {setPrivacyOpen(false); requestAnimationFrame(() => privacyTrigger.current?.focus());};
  useEffect(() => {if (privacyOpen) closePrivacyRef.current?.focus();}, [privacyOpen]);
  useEffect(() => {setConfirmOpen(false);}, [chinese]);
  const loginRef = useRef(null);
  const dialogRef = useRef(null);
  useEffect(() => {
    if (confirmOpen) dialogRef.current?.querySelector("button")?.focus();
  }, [confirmOpen]);
  const dismiss = () => {setConfirmOpen(false); requestAnimationFrame(() => loginRef.current?.focus());};
  const [agreed, setAgreed] = useState(false);
  const t = (en, zh) => chinese ? zh : en;
  const asset = name => `${import.meta.env.BASE_URL}assets/${name}`;
  return <section className={`signin-page signin-odyssey${entranceReady ? " signin-revealed" : " signin-preparing"}`} style={{'--signin-canvas': designTokens.color.neutral['0'].$extensions.modes[theme === 'dark' ? 'dark' : 'light'], '--signin-foreground': designTokens.color.neutral['700'].$extensions.modes[theme === 'dark' ? 'dark' : 'light']}} aria-label={t('Sign in', '登录')}>
    <div className="signin-scene" aria-hidden="true"><img className="signin-background" src={asset('signin-sky-full.png')} alt=""/></div>
    <img className="signin-logo" src={asset('signin-logo-white.svg')} alt="TapTap GameBuddy"/>
    <div className="signin-content" inert={confirmOpen || privacyOpen ? true : undefined}>
    <h1 className={`signin-headline${chinese ? " signin-headline-zh" : ""}`}>{chinese ? '找到属于你的' : 'Find your next'}<span className="signin-word-slot">{chinese ? '好游戏' : 'great game'}</span></h1>
    <div className="signin-main">
      <button ref={loginRef} className="signin-continue" aria-label={t('Continue with TapTap', 'TapTap 登录')} onClick={() => {if (!chinese || agreed) onContinue(); else setConfirmOpen(true);}}>{!chinese && <span>Continue with</span>}<img src={asset('signin-taptap-new.svg')} alt="TapTap"/>{chinese && <span>登录</span>}</button>
    <div className={`signin-legal${chinese ? " signin-legal-zh" : " signin-legal-en"}`} style={{
      '--agreement-size': `${agreementType.fontSize / 412 * 100}cqw`,
      '--agreement-leading': `${agreementType.lineHeight / 412 * 100}cqw`,
      '--agreement-weight': agreementType.fontWeight,
      '--agreement-tracking': `${agreementType.letterSpacing.value / 100}em`,
    }}>
      {chinese && <input id="signin-agreement" type="checkbox" checked={agreed} aria-labelledby="signin-agreement-copy" onChange={event => setAgreed(event.target.checked)}/> }
      <p id="signin-agreement-copy">{chinese ? <label htmlFor="signin-agreement">已阅读并同意</label> : 'By continuing, you agree to our '}<a href={privacyUrl} onClick={openPrivacy}>{t('Privacy Policy', '《隐私政策》')}</a></p>
    </div>
    </div>
    </div>
    {confirmOpen && chinese && <div inert={privacyOpen ? true : undefined} className="signin-consent-backdrop" onClick={event => {if (event.target === event.currentTarget) dismiss();}}>
      <div ref={dialogRef} className="signin-consent-dialog" role="dialog" aria-modal="true" aria-labelledby="signin-consent-title" aria-describedby="signin-consent-body" onKeyDown={event => {
        if (event.key === 'Escape') {event.preventDefault(); dismiss();}
        if (event.key === 'Tab') {
          const items = [...event.currentTarget.querySelectorAll('a,button')];
          const first = items[0], last = items[items.length - 1];
          if (event.shiftKey && document.activeElement === first) {event.preventDefault(); last.focus();}
          else if (!event.shiftKey && document.activeElement === last) {event.preventDefault(); first.focus();}
        }
      }}>
        <div className="signin-consent-copy">
          <h2 id="signin-consent-title">{t('Review & Continue', '先了解，再出发')}</h2>
          <p id="signin-consent-body">{t('Please review and agree to our ', '你的隐私安全对 GameBuddy 来说至关重要并受到保护，请先阅读并同意')}<a href={privacyUrl} onClick={openPrivacy}>{t('Privacy Policy', '《隐私政策》')}</a>{t(' to start using GameBuddy.', '，就可以和我们一起出发探索游戏了。')}</p>
        </div>
        <div className="signin-consent-actions">
          <button onClick={dismiss}>{t('Not now', '不同意')}</button>
          <button className="signin-consent-agree" onClick={() => {setAgreed(true); setConfirmOpen(false); onContinue();}}>{t('Agree', '同意并继续')}</button>
        </div>
      </div>
    </div>}
    {privacyOpen && <div className="signin-policy-view" role="dialog" aria-modal="true" aria-label={t('Privacy Policy', '隐私政策')} onKeyDown={event => {if (event.key === 'Escape') closePrivacy();}}>
      <header className="signin-policy-header">
        <button ref={closePrivacyRef} onClick={closePrivacy} aria-label={t('Close Privacy Policy and return to GameBuddy', '关闭隐私政策，返回 GameBuddy')}>{t('Close', '关闭')}</button>
        <div><strong>{t('Privacy Policy', '隐私政策')}</strong><small>game-copilot-service.tapapis.cn</small></div>
      </header>
      <iframe src={`${import.meta.env.BASE_URL}legal/privacy-policy.html`} title={t('GameBuddy Privacy Policy', 'GameBuddy 隐私政策')} sandbox="allow-same-origin" referrerPolicy="no-referrer" />
    </div>}
  </section>;
}
