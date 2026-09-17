import { useState } from 'react';
import { Mic, Images, Layers, Check, Trash2 } from './GBIcon';

export default function AppUtilities({ page, chinese }) {
  const t = (en, zh) => chinese ? zh : en;
  const [permissions, setPermissions] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('gb-demo-permissions')) || {}; } catch { return {}; }
  });
  const [cacheCleared, setCacheCleared] = useState(() => {
    try { return sessionStorage.getItem('gb-demo-cache-cleared') === 'true'; } catch { return false; }
  });
  const [message, setMessage] = useState('');
  const permissionsList = [
    ['mic', Mic, t('Microphone', '麦克风'), t('Talk to GameBuddy in audio chat.', '与 GameBuddy 进行语音聊天。')],
    ['photos', Images, t('Photos', '照片'), t('Search using screenshots you choose.', '使用你选择的截图进行搜索。')],
    ['overlay', Layers, t('Display over other apps', '显示在其他应用上层'), t('Show the Text HUD while you play.', '在游戏时显示文字 HUD。')],
  ];
  const changePermission = key => {
    const next = { ...permissions, [key]: !permissions[key] };
    setPermissions(next);
    try { sessionStorage.setItem('gb-demo-permissions', JSON.stringify(next)); } catch {}
  };
  if (page === 'permissions') return <>
    <p className="ac-utility-note">{t('Demo permissions. These controls preview Android access settings; they do not change device permissions.', '演示权限。这些控件用于预览 Android 权限设置，不会更改设备权限。')}</p>
    <div className="ac-group">{permissionsList.map(([key, Icon, label, description]) => <div className="ac-permission" key={key}>
      <div className="ac-row-label"><Icon className="ac-leading-icon" aria-hidden="true" /><strong>{label}</strong></div>
      <p>{description}</p>
      <button className="ac-permission-action" onClick={() => changePermission(key)} aria-label={permissions[key] ? t('Revoke demo access: ', '撤销演示权限：') + label : t('Allow demo access: ', '允许演示权限：') + label}>
        {permissions[key] && <Check aria-hidden="true" />}{permissions[key] ? t('Allowed · Revoke', '已允许 · 撤销') : t('Not allowed · Allow', '未允许 · 允许')}
      </button>
    </div>)}</div>
  </>;
  return <>
    <p className="ac-utility-note">{t('Sample storage usage for this demo.', '此处为演示存储数据。')}</p>
    <div className="ac-group">
      <div className="ac-row"><span>{t('App size', '应用大小')}</span><small>48 MB</small></div>
      <div className="ac-row"><span>{t('User data', '用户数据')}</span><small>2.4 MB</small></div>
      <div className="ac-row"><span>{t('Cache', '缓存')}</span><small>{cacheCleared ? '0 MB' : '18.6 MB'}</small></div>
      <div className="ac-row"><span>{t('Total', '总计')}</span><small>{cacheCleared ? '50.4 MB' : '69 MB'}</small></div>
    </div>
    <p className="ac-utility-note">{t('Clearing cache keeps your preferences, searches, and memories.', '清除缓存会保留偏好设置、搜索和记忆。')}</p>
    <button className="ac-primary ac-clear-cache" disabled={cacheCleared} onClick={() => {
      setCacheCleared(true);
      try { sessionStorage.setItem('gb-demo-cache-cleared', 'true'); } catch {}
      setMessage(t('Demo cache cleared. Your saved data is unchanged.', '演示缓存已清除，已保存的数据保持不变。'));
    }}><Trash2 aria-hidden="true" />{cacheCleared ? t('Cache cleared', '缓存已清除') : t('Clear cache', '清除缓存')}</button>
    {message && <p role="status" className="ac-utility-note">{message}</p>}
  </>;
}
