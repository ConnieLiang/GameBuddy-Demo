import './BuddyPage.css';

export default function SquadUnavailable({ chinese }) {
  return <section className="bp-page bp-overview">
    <div className="bp-search-center bp-wip">
      <h2>{chinese ? '组队功能正在升级中' : 'Squad is still leveling up'}</h2>
      <p>{chinese ? '页面还在打磨，稍后回城。' : 'This page is a work in progress. BRB.'}</p>
    </div>
  </section>;
}
