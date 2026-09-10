import { useState } from 'react';
import { ChevronDown, Delete, Search, ArrowUp } from 'lucide-react';
import './AndroidKeyboard.css';

export default function AndroidKeyboard({ chinese, onKey, onDismiss, onSearch }) {
  const [shift, setShift] = useState(false);
  const [symbols, setSymbols] = useState(false);
  const rows = symbols ? ['1234567890', '@#$%&-+()', '*"\':;!?'] : ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
  const press = key => { onKey(shift && !symbols ? key.toUpperCase() : key); setShift(false); };
  return <div className="android-keyboard" role="group" aria-label={chinese ? '屏幕键盘' : 'On-screen keyboard'} onPointerDown={e => e.preventDefault()}>
    <div className="ak-toolbar"><span>···</span><span>{chinese ? '英文 · QWERTY' : 'English · QWERTY'}</span><button type="button" onClick={onDismiss} aria-label={chinese ? '收起键盘' : 'Hide keyboard'}><ChevronDown /></button></div>
    {rows.map((row, index) => <div className={`ak-row ak-row-${index}`} key={index}>
      {index === 2 && <button type="button" className={`ak-key ak-special ${shift ? 'ak-selected' : ''}`} aria-label="Shift" aria-pressed={shift} onClick={() => setShift(!shift)}><ArrowUp /></button>}
      {[...row].map(key => <button type="button" className="ak-key" key={key} onClick={() => press(key)}>{shift && !symbols ? key.toUpperCase() : key}</button>)}
      {index === 2 && <button type="button" className="ak-key ak-special" aria-label={chinese ? '删除' : 'Backspace'} onClick={() => onKey('Backspace')}><Delete /></button>}
    </div>)}
    <div className="ak-row ak-bottom">
      <button type="button" className="ak-key ak-special" onClick={() => setSymbols(!symbols)}>{symbols ? 'ABC' : '?123'}</button>
      <button type="button" className="ak-key" onClick={() => onKey(',')}>,</button>
      <button type="button" className="ak-key ak-space" aria-label={chinese ? '空格' : 'Space'} onClick={() => onKey(' ')}>{chinese ? '空格' : 'English'}</button>
      <button type="button" className="ak-key" onClick={() => onKey('.')}>.</button>
      <button type="button" className="ak-key ak-search" aria-label={chinese ? '搜索' : 'Search'} onClick={onSearch}><Search /></button>
    </div>
    <div className="ak-navigation"><span /></div>
  </div>;
}
