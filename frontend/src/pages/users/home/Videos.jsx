import React from 'react';

const videos = [
  {
    id: 1,
    url: 'https://www.youtube.com/embed/2LqzF5WauAw?si=5N8BNXQgordpzas-', // Replace with actual YouTube embed URL
    title: 'Interstellar',
    desc: 'Interstellar is a 2014 science fiction film directed by Christopher Nolan.',
  },
  {
    id: 2,
    url: 'https://www.youtube.com/embed/SkGd0zH1DE4?si=Zcuo2c_5jYxPyOdh', // Replace with actual YouTube embed URL
    title: 'Dare Devil Born',
    desc: 'Dare Devil Born is a 2014 action film directed by Christopher Nolan.',
  },
  {
    id: 3,
    url: 'https://www.youtube.com/embed/TcMBFSGVi1c?si=uZDRnnng9x-8P3AJ', // Replace with actual YouTube embed URL
    title: 'Avengers Endgame',
    desc: 'Avengers Endgame is a 2014 action film directed by Christopher Nolan.',
  },
  {
    id: 4,
    url: 'https://www.youtube.com/embed/jg1Jt2Ft6xg?si=C9YfsHomLeX5TE4f', // Replace with actual YouTube embed URL
    title: 'Area 51',
    desc: 'Area 51 is a 2014 action film directed by Christopher Nolan.',
  },
];

export default function Videos() {
  return (
    <section id="videos" className="py-20 relative z-10 bg-black">
      <div className="mx-auto px-20">
        <h2 className="text-4xl justify-self-start font-bold text-yellow-400 mb-8 text-center">| Our Videos</h2>
        <div className="flex overflow-x-auto gap-8 pb-4">
          {videos.map((video) => (
            <div key={video.id} className="flex-shrink-0 w-80 md:w-[565.38px]">
              <div className="w-full aspect-video">
                <iframe
                  src={video.url}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <h3 className="text-2xl font-bold text-yellow-300 mt-4">{video.title}</h3>
              <p className="text-yellow-50/80 mt-2">{video.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}