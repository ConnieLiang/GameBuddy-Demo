export default function SplashScreen() {
  return <section className="gb-splash" aria-label="GameBuddy">
    <div className="gb-splash-mark">
      <img src={`${import.meta.env.BASE_URL}assets/splash-g-odyssey.svg`} alt=""/>
    </div>
    <div className="gb-splash-attribution"><span>from</span><img src={`${import.meta.env.BASE_URL}assets/splash-taptap-neutral.svg`} alt="TapTap"/></div>
  </section>;
}
