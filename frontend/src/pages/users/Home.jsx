import React, { useEffect, useState } from 'react';
import Hero from '../../components/users/sections/Hero';
import About from '../../components/users/sections/About';
import Services from '../../components/users/sections/Services';
import LineProduction from '../../components/users/sections/LineProduction';
import GetStarted from '../../components/users/sections/GetStarted';
import Projects from '../../components/users/sections/Projects';

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
      <Hero title={site?.title} tagline={site?.tagline} heroText={hero} />
      <About />
      <Services />
      <LineProduction />
      <Projects />
      <GetStarted />
    </div>
  );
}
