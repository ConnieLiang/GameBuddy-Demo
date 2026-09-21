import { useState } from 'react';
import './SignInPage.css';
export default function SignInPage({ chinese, onContinue, theme = 'light', entranceReady = true }) {
  const [legal, setLegal] = useState(null);
  const t = (en, zh) => chinese ? zh : en;
  const asset = name => `${import.meta.env.BASE_URL}assets/${name}`;
  return <section className={`signin-page signin-odyssey${entranceReady ? " signin-revealed" : " signin-preparing"}`} aria-label={t('Sign in', '登录')}>
    <div className="signin-scene" aria-hidden="true"><div className="signin-scene-gradient"/><div className="signin-landscape-crop"><img src={asset('signin-landscape-bottom.png')} alt=""/></div></div>
    <img className="signin-logo" src={asset(`gb-logo-${theme}.svg`)} alt="TapTap GameBuddy"/>
    <h1 className="signin-headline">{chinese ? '找到属于你的' : 'Find your next'}<span className="signin-word-slot">{chinese ? '好游戏' : 'great game'}</span></h1>
    <div className="signin-main" inert={legal ? true : undefined}>
      <button className="signin-continue" aria-label={t('Continue with TapTap', 'TapTap 登录')} onClick={onContinue}>{!chinese && <span>Continue with</span>}<img src={asset('signin-taptap.svg')} alt="TapTap"/>{chinese && <span>登录</span>}</button>
    <div className="signin-legal">
      <p>{t('By continuing you agree to our ', '登录即表示您同意我们的')}<button onClick={() => setLegal('terms')}>{t('Terms of Services', '服务条款')}</button>{t(' and ', '和')}<button onClick={() => setLegal('privacy')}>{t('Privacy Policy', '隐私政策')}</button></p>
    </div>
    <span className="signin-version">V1.23456</span>
    </div>
    {legal && <div className="signin-legal-panel" role="dialog" aria-modal="true" aria-labelledby="signin-legal-title">
      <h2 id="signin-legal-title">{legal === 'terms' ? t('Terms of Services', '服务条款') : t('Privacy Policy', '隐私政策')}</h2>
      <p>{t('This document is not available yet.', '文档暂未提供。')}</p>
      <button autoFocus className="signin-continue" onClick={() => setLegal(null)}>{t('Back', '返回')}</button>
    </div>}
  </section>;
}
