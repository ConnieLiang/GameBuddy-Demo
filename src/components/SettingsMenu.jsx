import { useEffect, useRef, useState, useId } from 'react';
import { Check } from 'lucide-react';

export default function SettingsMenu({ label, value, options, onChange, note }) {
  const [open, setOpen] = useState(false);
  const root = useRef(null), trigger = useRef(null), items = useRef([]);
  const id = useId();
  const close = () => { setOpen(false); trigger.current?.focus(); };
  useEffect(() => {
    if (!open) return;
    const selected = items.current[options.findIndex(([key]) => key === value)];
    selected?.focus({ preventScroll: true });
    selected?.scrollIntoView({ block: 'nearest' });
    const outside = e => { if (!root.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);
  return <div className="ac-settings-picker" ref={root} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }}>
    <button type="button" className="ac-mode-trigger" ref={trigger} aria-label={label + ': ' + options.find(([key]) => key === value)?.[1]} aria-haspopup="menu" aria-expanded={open} aria-controls={open ? id : undefined} onClick={() => setOpen(!open)} onKeyDown={e => { if (['ArrowDown', 'ArrowUp'].includes(e.key)) { e.preventDefault(); setOpen(true); } }}>{options.find(([key]) => key === value)?.[1]}</button>
    {open && <div className="ac-settings-popover">
      <div className="ac-settings-options" role="menu" aria-label={label} id={id} onKeyDown={e => {
        if (e.key === 'Escape') { e.preventDefault(); close(); }
        if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) {
          e.preventDefault();
          const index = items.current.indexOf(document.activeElement);
          const next = e.key === 'Home' ? 0 : e.key === 'End' ? options.length - 1 : (index + (e.key === 'ArrowDown' ? 1 : options.length - 1)) % options.length;
          items.current[next]?.focus();
        }
      }}>{options.map(([key, text], index) => <button type="button" key={key} ref={el => { items.current[index] = el; }} role="menuitemradio" aria-checked={value === key} onClick={() => { onChange(key); close(); }}><span dir="auto">{text}</span>{value === key && <Check aria-hidden="true" />}</button>)}</div>
      {note && <p className="ac-settings-note">{note}</p>}
    </div>}
  </div>;
}
