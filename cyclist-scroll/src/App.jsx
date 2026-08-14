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
          <h1>Scroll Down</h1>
          <p className="subtitle">Watch the cyclist cruise through the hills</p>
          <div className="scroll-arrow">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </div>
        </section>

        {[
          {
            title: 'Through the Valley',
            text: 'The road winds gently through lush green valleys, past quaint buildings and towering trees. Every turn reveals a new vista of rolling hills stretching to the horizon.',
            accent: '#2d6a4f',
          },
          {
            title: 'Climbing the Hills',
            text: 'The terrain rises steadily as the route follows the contours of the landscape. Distant mountains frame the sky in shades of blue and grey.',
            accent: '#457b9d',
          },
          {
            title: 'City Outskirts',
            text: 'Buildings begin to appear along the roadside — their warm windows glowing in the afternoon light. Lamp posts line the street, casting long shadows.',
            accent: '#e63946',
          },
          {
            title: 'The Open Road',
            text: 'Beyond the city, the road opens up. Nothing but pavement, painted lines, and the sound of wheels on asphalt. Freedom in motion.',
            accent: '#f4a261',
          },
          {
            title: 'Sunset Ridge',
            text: 'As the sun dips lower, the sky transforms into a canvas of warm hues. The final stretch of road glimmers with golden light reflected off the surface.',
            accent: '#e76f51',
          },
          {
            title: 'The Descent',
            text: 'Gravity becomes a companion on the downhill run. Wind rushes past as the bicycle picks up speed, carving through the curves with effortless momentum.',
            accent: '#264653',
          },
          {
            title: 'Finishing Strong',
            text: 'The journey nears its end, but the memories of every hill climbed and valley crossed remain. Each revolution of the pedals was a step forward, a rhythm of persistence.',
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
