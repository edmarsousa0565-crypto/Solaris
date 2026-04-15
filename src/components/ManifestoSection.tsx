'use client';

import MagneticText from './MagneticText';

const CLOTHING_IMAGES = [
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=40&w=300&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=40&w=300&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1550614000-4b95d4158173?q=40&w=300&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=40&w=300&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=40&w=300&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?q=40&w=300&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=40&w=300&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=40&w=300&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?q=40&w=300&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=40&w=300&auto=format&fit=crop',
];

const TILES = Array.from({ length: 120 }, (_, i) => CLOTHING_IMAGES[i % CLOTHING_IMAGES.length]);

// Fundo partilhado entre mobile e desktop
function Background() {
  return (
    <>
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <div className="w-full h-full" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gridAutoRows: '240px', overflow: 'hidden' }}>
          {TILES.map((src, i) => (
            <div key={i} className="overflow-hidden">
              <img src={src} alt="" aria-hidden="true" loading="lazy" className="w-full h-full object-cover grayscale" style={{ opacity: 0.12 }} />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-absolute-black/60" />
      </div>
      <div className="absolute inset-0 z-10 pointer-events-none opacity-[0.05]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`, backgroundRepeat: 'repeat', backgroundSize: '180px' }}
      />
      <div className="absolute inset-0 w-full h-full manifesto-video-container opacity-0 pointer-events-none z-[1]">
        <video src="https://assets.mixkit.co/videos/preview/mixkit-sun-shining-through-the-leaves-of-a-tree-39-large.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-absolute-black/60" />
      </div>
    </>
  );
}

export default function ManifestoSection() {
  return (
    <>
      {/* ── MOBILE: layout vertical ─────────────────────────────────────── */}
      <section className="md:hidden w-screen h-full relative flex flex-col justify-center shrink-0 overflow-hidden bg-absolute-black text-stark-white py-20 px-8 gap-16">
        <Background />
        <div className="absolute top-1/2 left-0 w-full h-px bg-stark-white/10 z-10 pointer-events-none" />

        <p className="relative z-20 font-mono text-[11px] tracking-[0.5em] uppercase text-stark-white/30">
          Manifesto — Solaris
        </p>

        <div className="relative z-20 flex flex-col gap-14">
          <div>
            <p className="font-mono text-[11px] tracking-[0.4em] uppercase text-stark-white/30 mb-2">01 —</p>
            <h2 className="font-serif italic text-[3.5rem] font-light tracking-widest text-solar-yellow leading-none">
              Luz pura.
            </h2>
          </div>

          <div>
            <p className="font-mono text-[11px] tracking-[0.4em] uppercase text-stark-white/30 mb-2">02 —</p>
            <p className="font-sans text-lg font-light tracking-[0.2em] uppercase text-stark-white/70 leading-relaxed">
              O peso do linho<br />sobre a pele.
            </p>
          </div>

          <div>
            <p className="font-mono text-[11px] tracking-[0.4em] uppercase text-stark-white/30 mb-2">03 —</p>
            <h2 className="font-serif text-[2.2rem] font-light tracking-wide leading-tight">
              Não vestimos corpos,
            </h2>
            <h2 className="font-serif italic text-[2.2rem] font-light tracking-wide text-oxidized-gold leading-tight">
              esculpimos sombras.
            </h2>
          </div>

          <div>
            <p className="font-mono text-[11px] tracking-[0.4em] uppercase text-stark-white/30 mb-2">06 —</p>
            <h2 className="font-serif text-[3rem] font-light tracking-[0.06em] text-oxidized-gold leading-none">
              Veste-te<br />de calma.
            </h2>
          </div>
        </div>
      </section>

      {/* ── DESKTOP: layout horizontal original ─────────────────────────── */}
      <section className="hidden md:flex w-[320vw] h-full relative items-center justify-center shrink-0 overflow-hidden bg-absolute-black text-stark-white">
        <Background />
        <div className="absolute top-[50%] left-0 w-full h-px bg-stark-white/10 z-10 pointer-events-none" />

        <div className="absolute top-8 left-[15vw] z-20 pointer-events-none">
          <p className="font-mono text-[13px] tracking-[0.5em] uppercase text-stark-white/30">
            Manifesto — Solaris
          </p>
        </div>

        <div className="relative w-full h-full flex items-center z-20">
          <div className="absolute left-[8vw] top-[22%] manifesto-word" data-speed="0.6">
            <MagneticText>
              <p className="font-mono text-[13px] tracking-[0.4em] uppercase text-stark-white/30 mb-3">01 —</p>
              <h2 className="font-serif italic text-[clamp(3rem,8vw,7rem)] font-light tracking-widest antialiased text-solar-yellow">
                Luz pura.
              </h2>
            </MagneticText>
          </div>

          <div className="absolute left-[38vw] top-[58%] manifesto-word" data-speed="-0.3" style={{ transform: 'rotate(-1.5deg)' }}>
            <MagneticText>
              <p className="font-mono text-[13px] tracking-[0.4em] uppercase text-stark-white/30 mb-3">02 —</p>
              <p className="font-sans text-[clamp(1rem,2.5vw,2rem)] font-light tracking-[0.25em] uppercase antialiased text-stark-white/70">
                O peso do linho sobre a pele.
              </p>
            </MagneticText>
          </div>

          <div className="absolute left-[78vw] top-[18%] manifesto-word" data-speed="0.8">
            <MagneticText>
              <p className="font-mono text-[13px] tracking-[0.4em] uppercase text-stark-white/30 mb-3">03 —</p>
              <h2 className="font-serif text-[clamp(2.5rem,5vw,5rem)] font-light tracking-widest antialiased leading-tight">
                Não vestimos corpos,
              </h2>
              <h2 className="font-serif italic text-[clamp(3rem,7vw,8rem)] font-light tracking-widest text-oxidized-gold antialiased leading-tight">
                esculpimos sombras.
              </h2>
            </MagneticText>
          </div>

          <div className="absolute left-[135vw] top-[5%] manifesto-word pointer-events-none" data-speed="0.15">
            <p className="font-serif text-[clamp(8rem,18vw,20rem)] font-light text-stark-white/[0.03] select-none leading-none">S</p>
          </div>

          <div className="absolute left-[148vw] top-[62%] manifesto-word" data-speed="-0.5" style={{ transform: 'rotate(1deg)' }}>
            <MagneticText>
              <p className="font-mono text-[13px] tracking-[0.4em] uppercase text-stark-white/30 mb-3">04 —</p>
              <p className="font-mono text-[clamp(0.65rem,1vw,0.85rem)] tracking-[0.5em] uppercase text-stark-white/50 antialiased">
                A forma revela-se.
              </p>
            </MagneticText>
          </div>

          <div className="absolute left-[182vw] top-[20%] manifesto-word" data-speed="0.7">
            <MagneticText>
              <p className="font-mono text-[13px] tracking-[0.4em] uppercase text-stark-white/30 mb-3">05 —</p>
              <h2 className="font-serif italic text-[clamp(2.5rem,5.5vw,6rem)] font-light tracking-widest antialiased">
                A pele recorda o que
              </h2>
              <h2 className="font-serif italic text-[clamp(2.5rem,5.5vw,6rem)] font-light tracking-widest antialiased text-stark-white/40">
                os olhos esquecem.
              </h2>
            </MagneticText>
          </div>

          <div className="absolute left-[228vw] top-[30%] manifesto-word" data-speed="-0.4">
            <MagneticText>
              <p className="font-mono text-[13px] tracking-[0.4em] uppercase text-stark-white/30 mb-4">06 —</p>
              <h2 className="font-serif text-[clamp(4rem,10vw,11rem)] font-light tracking-[0.06em] text-oxidized-gold antialiased leading-none">
                Veste-te<br />de calma.
              </h2>
            </MagneticText>
          </div>

          <div className="absolute left-[283vw] top-[55%] manifesto-word" data-speed="0.5" style={{ transform: 'rotate(-0.8deg)' }}>
            <MagneticText>
              <p className="font-mono text-[13px] tracking-[0.4em] uppercase text-stark-white/30 mb-3">07 —</p>
              <p className="font-mono text-[clamp(0.75rem,1.2vw,1rem)] tracking-[0.35em] uppercase text-stark-white/60 antialiased">
                O essencial não grita,
              </p>
              <p className="font-mono text-[clamp(0.75rem,1.2vw,1rem)] tracking-[0.35em] uppercase text-stark-white/25 antialiased">
                permanece.
              </p>
            </MagneticText>
          </div>
        </div>
      </section>
    </>
  );
}
