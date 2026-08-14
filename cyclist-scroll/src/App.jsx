import { useState, useEffect, useRef } from 'react';
import Cyclist from './components/Cyclist';
import Terrain from './components/Terrain';
import './App.css';

function roadCenterAt(progress) {
  const totalWidth = 8000;
  const viewWidth = 400;
  const segments = 120;
  const segment = (progress * (totalWidth - viewWidth) + viewWidth / 2) / (totalWidth / segments);
  const roadOffset = Math.sin(segment * 0.4) * 40
    + Math.sin(segment * 0.15) * 30
    + Math.cos(segment * 0.7) * 20;

  return ((245 + roadOffset) / 400) * 100;
}

function App() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef(null);
  const roadCenter = roadCenterAt(scrollProgress);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(Math.max(scrollTop / docHeight, 0), 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="app" ref={containerRef}>
      {/* Fixed cycling sidebar */}
      <aside className="cyclist-sidebar">
        <div className="cycling-scene">
          <Terrain scrollProgress={scrollProgress} />
          <div className="cyclist-wrapper" style={{ top: `${roadCenter}%` }}>
            <Cyclist />
          </div>
        </div>
        <div className="scroll-indicator">
          <div className="scroll-track">
            <div
              className="scroll-thumb"
              style={{ width: `${scrollProgress * 100}%` }}
            />
          </div>
          <span className="scroll-label">
            {Math.round(scrollProgress * 100)}%
          </span>
        </div>
      </aside>

      {/* Main content area */}
      <main className="main-content">
        <section className="content-section hero-section">
          <h1>Ride your map</h1>
          <p className="subtitle">From Dutch lowlands to legendary Alpine roads</p>
          <div className="scroll-arrow">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </div>
        </section>

        {[
          {
            title: 'Netherlands → Bocholt',
            text: 'Start on the open lanes west of Bocholt: straight horizons, canals, windmills, brick villages, and a tailwind that feels almost suspiciously generous.',
            accent: '#2d6a4f',
          },
          {
            title: 'Stuttgart’s rolling climbs',
            text: 'The flatlands give way to wooded slopes and vineyards around Stuttgart. The roads tighten, the city peeks through, and every ridge earns its view.',
            accent: '#457b9d',
          },
          {
            title: 'Mont Ventoux',
            text: 'Then comes Provence’s giant: forest on the lower slopes, exposed limestone near the summit, and the unmistakable silhouette of the weather station above.',
            accent: '#e63946',
          },
          {
            title: 'Alpe d’Huez',
            text: 'Finish high in the Alps, tracing the famous switchbacks beneath sharp peaks. Each bend is a small promise that the next one is closer to the top.',
            accent: '#f4a261',
          },
          {
            title: 'Across every landscape',
            text: 'The scenery changes, but the rhythm stays the same: road, breath, wheels, horizon.',
            accent: '#e76f51',
          },
          {
            title: 'The descent',
            text: 'After the climbing comes the reward—smooth corners, cold air, and the quiet hum of tires carrying you home.',
            accent: '#264653',
          },
          {
            title: 'Finishing strong',
            text: 'Your favourite roads live in the legs long after the ride ends: local loops, city climbs, and the mountains that keep calling you back.',
            accent: '#2a9d8f',
          },
        ].map((section, i) => (
          <section key={i} className="content-section">
            <div className="section-accent" style={{ backgroundColor: section.accent }} />
            <h2>{section.title}</h2>
            <p>{section.text}</p>
            <div className="section-decoration">
              <div className="deco-line" style={{ backgroundColor: section.accent }} />
              <div className="deco-dot" style={{ backgroundColor: section.accent }} />
            </div>
          </section>
        ))}

        <section className="content-section hero-section">
          <h1>Journey Complete</h1>
          <p className="subtitle">You've reached the end of the ride</p>
        </section>
      </main>
    </div>
  );
}

export default App;
