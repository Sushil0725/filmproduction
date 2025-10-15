import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    fetch('/api/public/json/site').then(async (r) => {
      if (r.ok) setSite(await r.json());
    }).catch(() => {});
    fetch('/api/public/text/hero').then(async (r) => {
      if (r.ok) setHero(await r.text());
    }).catch(() => {});
  }, []);

  return (
    <div>
      <Intro />
      <Hero title={site?.title} tagline={site?.tagline} heroText={hero} />
      <RecentHighlights />
      <About />
      <Services />
      <LineProduction />
      <Projects />
      <Videos/>
      <GetStarted />
    </div>
  );
}
