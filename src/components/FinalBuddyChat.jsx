import OnboardingChatLayout from './OnboardingChatLayout';
import { TypingChatBubble, ChatReplyCards } from './OnboardingChatMotion';
import { loadBuddyState } from './BuddyPage';

export default function FinalBuddyChat({ chinese, onComplete }) {
  const t = (en, zh) => chinese ? zh : en;
  const choices = [
    ['gaming-wingman', 'Wingman', '电竞搭子', 'Easygoing, playful, on your side.', '轻松有趣，始终站在你这边。', 'wingman'],
    ['hardcore-commander', 'Commander', '铁血指挥官', 'Calm, direct, focused on your next move.', '冷静直接，帮你想清楚下一步。', 'commander']
  ];
  const choose = id => {
    const state = loadBuddyState();
    state.active = id;
    try { localStorage.setItem('gamebuddy-buddy-demo-v1', JSON.stringify(state)); } catch {}
    onComplete();
  };
  return <OnboardingChatLayout chinese={chinese} className="iq-final-buddy" birdAsset="onboarding-gatsby-search-poses.png">
    <TypingChatBubble>{t(
      'One last thing: pick a Buddy who gets you for your next adventure. Not ready to choose? You can always do this later on the Buddy page.',
      '最后，选一位懂你的 Buddy，一起开启游戏冒险。还没想好也没关系，之后随时可以去 Buddy 页面选择。'
    )}</TypingChatBubble>
    <div className="iq-inline-replies"><ChatReplyCards>
      {choices.map(([id, en, zh, enDesc, zhDesc, pose]) => <button className="iq-buddy-choice" key={id} onClick={() => choose(id)}>
        <span><strong>{t(en, zh)}</strong><small>{t(enDesc, zhDesc)}</small></span>
        <span className={`iq-buddy-pose iq-buddy-pose-${pose}`} aria-hidden="true"><img src={`${import.meta.env.BASE_URL}assets/onboarding-buddy-poses.png`} alt=""/></span>
      </button>)}
      <button onClick={onComplete}>{t('Maybe later', '稍后再选')}</button>
    </ChatReplyCards></div>
  </OnboardingChatLayout>;
}
