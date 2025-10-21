import React, { useEffect, useState } from 'react';
import { useNavigationType } from 'react-router-dom';
import Intro from './home/Intro';
import Hero from './home/Hero';
import About from './home/About';
import Services from './home/Services';
import LineProduction from './home/LineProduction';
import GetStarted from './home/GetStarted';
import Projects from './home/Projects';
import RecentHighlights from './home/RecentHighlights';
import Videos from './home/Videos';

export default function Home() {
  const [site, setSite] = useState(null);
  const [hero, setHero] = useState('');
  const navType = useNavigationType();
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    fetch('/api/public/json/site').then(async (r) => {
      if (r.ok) setSite(await r.json());
    }).catch(() => {});
    fetch('/api/public/text/hero').then(async (r) => {
      if (r.ok) setHero(await r.text());
    }).catch(() => {});
  }, []);

  useEffect(() => {
    let should = false;
    try {
      const played = sessionStorage.getItem('introPlayed') === '1';
      should = !played && navType === 'POP';
      if (should) {
        sessionStorage.setItem('introPlayed', '1');
      }
    } catch (e) {
      should = navType === 'POP';
    }
    setShowIntro(should);
  }, [navType]);

  return (
    <div>
      {showIntro && <Intro />}
      <Hero title={site?.title} tagline={site?.tagline} heroText={hero} />
      <RecentHighlights />
      <Services />
      <Projects />
      <Videos/>
      <GetStarted />
    </div>
  );
}
