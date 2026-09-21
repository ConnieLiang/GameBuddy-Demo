import { TypingChatBubble, ChatReplyCards } from './OnboardingChatMotion';
import OnboardingChatLayout from './OnboardingChatLayout';
import OnboardingAssistPreview from './OnboardingAssistPreview';

export default function HonorOfKingsOnboarding({ chinese }) {
  const t = (en, zh) => chinese ? zh : en;
  return <OnboardingChatLayout chinese={chinese} className="iq-hok" birdAsset="onboarding-gatsby-poses.png">
      <TypingChatBubble><p>{t(
        'Honor of Kings?! We’ve got you covered. From laning to teamfights, I’ll help you read your opponents and back you up!',
        '王者荣耀?! 这款游戏我们已经全面支持，从对线到团战，帮你看懂对手，助你一臂之力！'
      )}</p>
        <div className="iq-hok-preview iq-hok-preview-strategy"><OnboardingAssistPreview chinese={chinese}/></div>
        <p>{t(
          'Want to try it now? Allow “Appear on top” so I can stay within reach while you play.',
          '现在就试试？开启“显示在其他应用上层”，我就能在游戏中随时帮你。'
        )}</p>
      </TypingChatBubble>
      <div className="iq-inline-replies"><ChatReplyCards>
        <button type="button" className="iq-recommended-action"><span>{t('Allow Appear on top', '开启悬浮窗权限')}</span><span className="iq-recommended-tag">{t('Recommended', '推荐')}</span></button>
        <button type="button">{t('Authorize match history', '获取对局数据')}</button>
      </ChatReplyCards></div>
  </OnboardingChatLayout>;
}
