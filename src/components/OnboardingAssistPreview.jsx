// Read-only showcase from Figma 1301:6845. Controls are illustrative, not interactive.
export default function OnboardingAssistPreview({ chinese }) {
  const t = (en, zh) => chinese ? zh : en;
  const asset = file => `${import.meta.env.BASE_URL}assets/ga-intro-${file}`;
  function Sidebar({ strategy = false }) {
    const items = [
      [strategy ? 'd71e1.svg' : '4aaab.svg', t('Tips', '提示')],
      ['98430.svg', strategy ? t('Dialogue', '对话') : t('Chat', '聊天')],
      ['4529b.svg', t('Skill CD', '技能 CD')],
      [strategy ? '537e6.svg' : 'c6e88.svg', t('Strategy', '策略')],
    ];
    return <div className="ob-ga-sidebar">{items.map(([icon, label], i) => <div key={icon} className={(strategy ? i === 3 : i === 0) ? 'active' : ''}><img src={asset(icon)} alt=""/><span>{label}</span></div>)}</div>;
  }
  const tips = [
    [t('Strategic Advice', '战术建议'), t('Enemy Si Kong Zhen overextended — gank opportunity', '敌方司空震站位过深，可以寻找抓人机会'), '10:41'],
    [t('Timing Alert', '时机提醒'), t('Enemy Kai overextended — gank opportunity', '敌方铠站位过深，可以寻找抓人机会'), '10:42'],
    [t('Timing Alert', '时机提醒'), t('[10-Min Dragon Fight — 9m 50s]\nShowdown: Tyrant respawning, team fight imminent', '【十分钟龙团 — 9分50秒】\n暴君即将刷新，团战一触即发'), '10:43'],
  ];
  return <div className="ob-ga-showcase" role="img" aria-label={t('GameAssist preview: in-game tips, chat, skill cooldowns, and matchup strategy', 'GameAssist 界面预览：游戏提示、对话、技能 CD与对战策略')}>
    <div className="ob-ga-panel ob-ga-panel-strategy" aria-hidden="true">
      <Sidebar strategy/>
      <div className="ob-ga-strategy-content">
        <div className="ob-ga-portraits">{['4629b.png','02b25.png','5e0c8.png','7f88e.png','8788f.png'].map(file => <img key={file} src={asset(file)} alt=""/>)}</div>
        <div className="ob-ga-matchup"><div className="ob-ga-opponent"><strong>{t('Si Kongzhen', '司空震')}</strong><span>{t('Countered', '被克制')}</span></div>
          <div className="ob-ga-phases"><span>{t('Laning', '对线')}</span><span>{t('Skirmish', '小规模团战')}</span><span>{t('Teamfight', '团战')}</span></div>
          <p>{t("Save your ultimate in teamfights to counter Si Kongzhen's engage. When Si Kongzhen activates his ultimate, cast yours at his landing point or around your team's carries. Use the bind and vision-reveal effects to restrict his damage output. Coordinate with teammates to focus fire, using your second ability's pull and chess-piece link damage to add extra crowd control and damage. Avoid fighting him head-on alone.", '团战时保留大招应对司空震进场。他开启大招时，在落点或己方核心周围释放大招，利用束缚和视野效果限制输出。配合队友集火，用二技能拉扯和棋子连线补充控制与伤害，避免单独正面交锋。')}</p>
        </div>
      </div>
    </div>
    <div className="ob-ga-panel ob-ga-panel-tips" aria-hidden="true"><Sidebar/><div className="ob-ga-tips-content">{tips.map(([label, text, time]) => <div className="ob-ga-tip-row" key={time}><div className="ob-ga-tip-meta"><span>{label}</span><em>{t('In Game', '游戏中')}</em><time>{time}</time></div><p>{text}</p></div>)}</div></div>
  </div>;
}
