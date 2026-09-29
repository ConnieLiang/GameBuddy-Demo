import { useEffect, useRef } from 'react';
import OnboardingChatLayout from './OnboardingChatLayout';
import { TypingChatBubble } from './OnboardingChatMotion';

export default function SearchGameOnboarding({ chinese, gameName, onContinue }) {
  const timer = useRef(null);
  const next = useRef(onContinue);
  next.current = onContinue;
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => { clearTimeout(timer.current); }, [chinese, gameName]);
  const advanceAfterTyping = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => next.current(), 1000);
  };
  const message = chinese
    ? `${gameName ? gameName + '？这款我也喜欢！' : '想聊哪款游戏都可以！'}想找游戏资讯、攻略，或是遇到了什么问题，都可以发消息、截图或游戏片段给我。我会尽力帮你找到答案！`
    : `${gameName ? gameName + '? I love this game too!' : 'Whatever you’re playing, let’s talk games!'} Looking for news, tips, or a little help? Send me a message, screenshot, or gameplay clip, and I’ll do my best to find the answers!`;
  return <OnboardingChatLayout chinese={chinese} className="iq-search-game" birdAsset="illustrations/gatsby-loving.png">
    <TypingChatBubble onTypingComplete={advanceAfterTyping}>{message}</TypingChatBubble>
  </OnboardingChatLayout>;
}
