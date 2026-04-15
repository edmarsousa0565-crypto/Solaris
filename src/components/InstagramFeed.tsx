'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const POSTS = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=600&auto=format&fit=crop',
    likes: '1.2K',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop',
    likes: '847',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=600&auto=format&fit=crop',
    likes: '2.1K',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=600&auto=format&fit=crop',
    likes: '934',
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1550614000-4b95d4158173?q=80&w=600&auto=format&fit=crop',
    likes: '1.5K',
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?q=80&w=600&auto=format&fit=crop',
    likes: '678',
  },
  {
    id: 7,
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=600&auto=format&fit=crop',
    likes: '1.1K',
  },
  {
    id: 8,
    image: 'https://images.unsplash.com/photo-1581338834647-b0fb40704e21?q=80&w=600&auto=format&fit=crop',
    likes: '756',
  },
  {
    id: 9,
    image: 'https://images.unsplash.com/photo-1572804013427-4d7ca7268217?q=80&w=600&auto=format&fit=crop',
    likes: '1.8K',
  },
];

export default function InstagramFeed() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef  = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(headerRef.current,
      { opacity: 0, y: 24 },
      {
        opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: headerRef.current, start: 'top 85%' }
      }
    );
    gsap.fromTo('.ig-cell',
      { opacity: 0, scale: 0.97 },
      {
        opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out',
        stagger: 0.06,
        scrollTrigger: { trigger: '.ig-grid', start: 'top 80%' }
      }
    );
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="py-20 md:py-28 border-t border-absolute-black/10 bg-raw-linen">
      {/* Header */}
      <div
        ref={headerRef}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-8 md:px-16 mb-10"
        style={{ opacity: 0 }}
      >
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-absolute-black flex items-center justify-center">
            <span className="text-solar-yellow text-[13px]">✦</span>
          </div>
          <div className="flex flex-col">
            <p className="font-mono text-[13px] tracking-[0.35em] uppercase text-absolute-black">
              @solarisstore
            </p>
            <p className="font-mono text-[13px] tracking-wider text-absolute-black/90">
              Instagram · Segue-nos
            </p>
          </div>
        </div>
        <a
          href="https://instagram.com/solarisstore"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 font-mono text-[13px] tracking-[0.3em] uppercase text-absolute-black border border-absolute-black/20 px-6 py-3 hover:bg-absolute-black hover:text-stark-white transition-colors duration-300 w-fit"
        >
          Seguir no Instagram
          <span>←’</span>
        </a>
      </div>

      {/* Grid 3×3 */}
      <div className="ig-grid grid grid-cols-3 md:grid-cols-3 lg:grid-cols-9 gap-px bg-absolute-black/10">
        {POSTS.map((post) => (
          <a
            key={post.id}
            href="https://instagram.com/solarisstore"
            target="_blank"
            rel="noopener noreferrer"
            className="ig-cell block relative aspect-square overflow-hidden group bg-bleached-concrete"
            style={{ opacity: 0 }}
          >
            <img loading="lazy" decoding="async"
              src={post.image}
              alt=""
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-absolute-black/0 group-hover:bg-absolute-black/40 transition-colors duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center gap-1">
                <span className="text-stark-white text-[13px] md:text-sm">â™¥</span>
                <span className="font-mono text-[13px] md:text-[13px] tracking-widest text-stark-white">
                  {post.likes}
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
