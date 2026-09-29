import { useEffect, useRef } from 'react';
import { ChatMotionProvider } from './OnboardingChatMotion';
import { motion, useReducedMotion } from 'framer-motion';

export default function OnboardingChatLayout({ chinese, children, className = '', birdAsset = 'illustrations/gatsby-friendly.png' }) {
  const transcript = useRef(null);
  const reduce = useReducedMotion();
  useEffect(() => { transcript.current?.focus({ preventScroll: true }); }, []);
  return <ChatMotionProvider><section className={`ob-page iq-page iq-conversation iq-minimal ${className}`} lang={chinese ? 'zh-CN' : 'en'} aria-label={chinese ? '与 Gatsby 的对话' : 'Chat with Gatsby'}>
    <div ref={transcript} className="iq-scroll iq-transcript" tabIndex={-1}>
      <motion.div className="iq-welcome-bird iq-chat-bird" aria-hidden="true"
        initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .3 }}>
        <img src={`${import.meta.env.BASE_URL}assets/${birdAsset}`} alt=""/>
      </motion.div>
      {children}
    </div>
  </section></ChatMotionProvider>;
}
