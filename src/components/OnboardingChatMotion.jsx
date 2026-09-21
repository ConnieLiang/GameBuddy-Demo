import { Children, cloneElement, createContext, isValidElement, useCallback, useContext, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const ChatMotion = createContext({ pending: false, mark: () => {} });

export function ChatMotionProvider({ children }) {
  const [active, setActive] = useState(new Set());
  const mark = useCallback((id, busy) => setActive(previous => {
    const next = new Set(previous);
    if (busy) next.add(id); else next.delete(id);
    return next;
  }), []);
  return <ChatMotion.Provider value={{ pending: active.size > 0, mark }}>{children}</ChatMotion.Provider>;
}

// Type paragraph copy while leaving embedded previews intact.
export function TypingChatBubble({ children, className = '', onTypingComplete, ...props }) {
  const { mark } = useContext(ChatMotion);
  const id = useId();
  const reduce = useReducedMotion();
  const nodes = Children.toArray(children);
  const textOf = node => typeof node === 'string' ? node : isValidElement(node) && (node.type === 'p' || node.type === 'small') ? Children.toArray(node.props.children).filter(x => typeof x === 'string').join('') : '';
  const texts = nodes.map(textOf);
  const signature = JSON.stringify(texts);
  const totalLetters = texts.reduce((sum, text) => sum + Array.from(text).length, 0);
  const [typing, setTyping] = useState({ signature: '', stage: 0, count: 0 });
  const current = typing.signature === signature ? typing : { stage: 0, count: 0 };
  const completion = useRef(onTypingComplete);
  completion.current = onTypingComplete;
  const completedSignature = useRef(null);
  const finished = reduce || current.stage >= nodes.length || (current.stage === nodes.length - 1 && current.count >= Array.from(texts[current.stage] || '').length);
  useEffect(() => {
    if (!finished) { completedSignature.current = null; return; }
    if (completedSignature.current !== signature) {
      completedSignature.current = signature;
      completion.current?.();
    }
  }, [finished, signature]);
  useLayoutEffect(() => {
    mark(id, !reduce && nodes.length > 0);
    return () => mark(id, false);
  }, [id, signature, reduce, mark]);
  useEffect(() => {
    if (reduce) return;
    let stage = 0;
    let count = 0;
    let timer;
    const sections = JSON.parse(signature);
    const update = () => setTyping({ signature, stage, count });
    const advance = () => {
      stage++;
      count = 0;
      update();
      if (stage < sections.length) runSection();
      else mark(id, false);
    };
    const tick = () => {
      count++;
      update();
      if (count < Array.from(sections[stage]).length) {
        timer = setTimeout(tick, 2200 / Math.max(1, totalLetters));
      } else {
        timer = setTimeout(advance, 200);
      }
    };
    const runSection = () => {
      // Give the preview time to reveal and settle before the next paragraph.
      timer = setTimeout(sections[stage] ? tick : advance, sections[stage] ? 30 : 700);
    };
    update();
    timer = setTimeout(runSection, 150);
    return () => clearTimeout(timer);
  }, [signature, reduce, id, mark]);
  return <div {...props} className={`iq-chat-bubble iq-chat-gb ${className}`}>
    {nodes.map((node, i) => {
      const text = texts[i];
      const revealed = reduce || i <= current.stage;
      if (!text) return <motion.div key={i}
        aria-hidden={!revealed}
        initial={false}
        animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 8 }}
        transition={{ duration: reduce ? 0 : .3 }}
        style={{ visibility: revealed ? 'visible' : 'hidden' }}>{node}</motion.div>;
      const letters = Array.from(text);
      const visible = reduce || i < current.stage ? text : i === current.stage ? letters.slice(0, current.count).join('') : '';
      const content = <span className="iq-typing-message" aria-label={revealed ? text : undefined} aria-hidden={!revealed}><span className="iq-typing-reserve" aria-hidden="true">{text}</span><span className="iq-typing-visible" aria-hidden="true">{visible}</span></span>;
      return isValidElement(node) ? cloneElement(node, { key: i }, content) : <span key={i}>{content}</span>;
    })}
  </div>;
}

export function ChatReplyCards({ children, ...props }) {
  const { pending } = useContext(ChatMotion);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(false);
    if (pending) return;
    const timer = setTimeout(() => setReady(true), 500);
    return () => clearTimeout(timer);
  }, [pending, children]);
  return <div {...props} className="iq-options iq-animated-options" data-ready={ready && !pending} inert={!ready || pending ? true : undefined} style={{ visibility: ready && !pending ? 'visible' : 'hidden' }}>{children}</div>;
}
