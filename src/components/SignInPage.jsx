import { useState } from 'react';
import './SignInPage.css';
import { useReducedMotion } from 'framer-motion';

// Gamer vocabulary across competitive, co-op, card, and sandbox games.
const discoveryWords = [
  'great game', 'duo', 'team comp', 'loadout', 'ranked win',
  'clutch', 'hero', 'build', 'lineup', 'squad',
  'combo', 'deck', 'agent', 'champion', 'drop spot',
  'walkthrough', 'raid team', 'speedrun', 'world', 'adventure',
];

const discoveryWordsZh = [
  '好游戏', '双排搭子', '上分阵容', '神装', '下一颗星',
  '翻盘机会', '英雄', '新套路', '技能点位', '开黑车队',
  '丝滑小连招', '卡组', '本命特工', '拿手英雄', '跳伞落点',
  '通关攻略', '开荒团', '速通捷径', '新世界', '下一场冒险',
];

function DiscoveryWord({ chinese }) {
  const [index, setIndex] = useState(0);
  const reducedMotion = useReducedMotion();
  return <span className="signin-word-slot" aria-hidden="true"><span
    key={index}
    className="signin-discovery-word"
    onAnimationEnd={() => { if (!reducedMotion) setIndex(value => (value + 1) % discoveryWords.length); }}
  >{(chinese ? discoveryWordsZh : discoveryWords)[reducedMotion ? 0 : index]}</span></span>;
}

export default function SignInPage({ chinese, onContinue, entranceReady = true }) {
  const [legal, setLegal] = useState(null);
  const t = (en, zh) => chinese ? zh : en;
  const asset = name => `${import.meta.env.BASE_URL}assets/${name}`;
  return <section className={`signin-page signin-odyssey${entranceReady ? " signin-revealed" : " signin-preparing"}`} aria-label={t('Sign in', '登录')}>
    <div className="signin-scene" aria-hidden="true"><div className="signin-scene-gradient"/><img src={asset('signin-figma-landscape.png')} alt=""/></div>
    <img className="signin-logo" src={asset('gb-logo-light.svg')} alt="TapTap GameBuddy"/>
    <h1 className="signin-headline" aria-label={chinese ? '找到属于你的游戏、攻略与队友' : 'Find your next game, strategy, or teammate'}>{chinese ? '找到属于你的' : 'Find your next'}<DiscoveryWord key={chinese ? 'zh' : 'en'} chinese={chinese}/></h1>
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
