import { useEffect, useRef, useState } from 'react';
import './SignInPage.css';
import GameLogoLoop from './GameLogoLoop';
import designTokens from '../../design.tokens.json';

const loaderColor = designTokens.color.neutral['200'].$value;

export default function SignInPage({ chinese, onContinue }) {
  const [legal, setLegal] = useState(null);
  const [loading, setLoading] = useState(false);
  const continueRef = useRef(onContinue);
  continueRef.current = onContinue;
  useEffect(() => {
    if (!loading) return;
    const timer = window.setTimeout(() => continueRef.current(), 2000);
    return () => window.clearTimeout(timer);
  }, [loading]);
  const t = (en, zh) => chinese ? zh : en;
  const asset = name => `${import.meta.env.BASE_URL}assets/${name}`;
  if (loading) return <section className="signin-page signin-loading" role="status" aria-label={t('Loading Home', '正在加载首页')} aria-busy="true">
    <div className="signin-loader-group" aria-hidden="true">
      <div className="signin-loader-mark"><img src={asset('loading-mark.svg')} alt="" /></div>
      <div className="signin-loader-track">
        <div className="signin-loader-fill">
          <div className="signin-loader-signal" style={{ backgroundColor: loaderColor }} />
        </div>
      </div>
    </div>
  </section>;
  return <section className="signin-page" aria-label={t('Sign in', '登录')}>
    <div className="signin-background" aria-hidden="true">
      <GameLogoLoop />
      <div className="signin-shade" />
    </div>
    <div className="signin-brand"><img src={asset('signin-mark.svg')} alt=""/><span>GameBUDDY</span></div>
    <div className="signin-main" inert={legal ? true : undefined}>
      <h1>{t('GET MORE OUT OF YOUR GAMES', '让游戏更好玩')}</h1>
      <button className="signin-continue" onClick={() => setLoading(true)}>{t('Continue with TapTap', 'TapTap 登录')}</button>
    </div>
    <div className="signin-legal" inert={legal ? true : undefined}>
      <p>{t('By continuing you agree to our', '登录即表示您同意我们的')}</p>
      <button onClick={() => setLegal('terms')}>{t('Terms of Services', '服务条款')}</button>{t(' & ', '和')}<button onClick={() => setLegal('privacy')}>{t('Privacy Policy', '隐私政策')}</button>
    </div>
    {legal && <div className="signin-legal-panel" role="dialog" aria-modal="true" aria-labelledby="signin-legal-title">
      <h2 id="signin-legal-title">{legal === 'terms' ? t('Terms of Services', '服务条款') : t('Privacy Policy', '隐私政策')}</h2>
      <p>{t('This document is not available yet.', '文档暂未提供。')}</p>
      <button autoFocus className="signin-continue" onClick={() => setLegal(null)}>{t('Back', '返回')}</button>
    </div>}
  </section>;
}
